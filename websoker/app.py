
import os
import asyncio
import websockets
import json
import traceback
from config import supabase

clientes_conectados = set()
# Map de canal -> set de websockets suscritos (para notificaciones)
channel_subscriptions = {}
# Map de websocket -> set de canales suscritos (para limpieza rápida)
ws_channels = {}

# Último id conocido para el poller realtime
last_seen_id = 0
# Nombre de la columna PK a usar en el poller (se detecta al arrancar)
pk_column = None


def sanear_mensaje(raw):
    
    try:
        raw = raw.replace("\x00", "")
    except Exception:
        raw = str(raw)
    # Postman a veces incluye un prefijo como '(Text):\r\n' o '(Binary):\r\n' — eliminarlo
    if isinstance(raw, str) and raw.startswith('(Text):'):
        # quitar hasta la primera nueva línea
        idx = raw.find('\r\n')
        if idx == -1:
            idx = raw.find('\n')
        if idx != -1:
            raw = raw[idx+2:]
        else:
            # si no hay newline, quitar el prefijo simple
            raw = raw[len('(Text):'):]
    if isinstance(raw, str) and raw.startswith('(Binary):'):
        idx = raw.find('\r\n')
        if idx == -1:
            idx = raw.find('\n')
        if idx != -1:
            raw = raw[idx+2:]
        else:
            raw = raw[len('(Binary):'):]
    if raw and raw[0] == '\ufeff':
        raw = raw.lstrip('\ufeff')
    return raw.strip()


def intentar_reparar_json(raw):
    
    if not raw or not isinstance(raw, str):
        return None, None

    cand = raw.strip()

    # Si el mensaje viene sin la llave inicial pero contiene "action" u otras claves
    if not cand.startswith('{') and ('"action"' in cand or "'action'" in cand):
        cand2 = '{' + cand
        if not cand2.endswith('}'):
            cand2 = cand2 + '}'
        try:
            obj = json.loads(cand2)
            return cand2, obj
        except Exception:
            pass

    # Equilibrar llaves si faltan cierres
    opens = cand.count('{')
    closes = cand.count('}')
    if opens > closes:
        cand2 = cand + ('}' * (opens - closes))
        try:
            obj = json.loads(cand2)
            return cand2, obj
        except Exception:
            pass

    # Si el payload está entrecomillado literalmente (ej: '"action":...') intentar quitar comillas envolventes
    if (cand.startswith('"') and cand.endswith('"')) or (cand.startswith("'") and cand.endswith("'")):
        inner = cand[1:-1]
        try:
            obj = json.loads(inner)
            return inner, obj
        except Exception:
            # también intentar envolver inner con llaves
            maybe = '{' + inner + '}'
            try:
                obj = json.loads(maybe)
                return maybe, obj
            except Exception:
                pass

    # Último intento: si la cadena no comienza por '{' pero contiene ':' y comillas, envolver y probar
    if not cand.startswith('{') and ':' in cand and '"' in cand:
        cand2 = '{' + cand + '}'
        try:
            obj = json.loads(cand2)
            return cand2, obj
        except Exception:
            pass

    return None, None


def normalize_product_keys(product):
    
    if not product or not isinstance(product, dict):
        return product
    return {str(k).lower(): v for k, v in product.items()}


async def envio_seguro(ws, mensaje: dict) -> bool:
    
    try:
        await ws.send(json.dumps(mensaje))
        return True
    except Exception as e:
        try:
            print(f"envio_seguro error a {ws.remote_address}: {e}")
        except Exception:
            print(f"envio_seguro error a websocket desconocido: {e}")
        return False


def _cleanup_ws(ws):
    """Quitar websocket de estructuras de tracking (no async)."""
    try:
        if ws in clientes_conectados:
            clientes_conectados.remove(ws)
    except Exception:
        pass
    chans = ws_channels.pop(ws, None)
    if chans:
        for ch in list(chans):
            subs = channel_subscriptions.get(ch)
            if subs and ws in subs:
                subs.remove(ws)
            if subs is not None and len(subs) == 0:
                channel_subscriptions.pop(ch, None)


async def heartbeat_loop(ping_interval: int = 10, ping_timeout: int = 5):
    """Enviar pings periódicos a todos los clientes conectados y cerrar los que no respondan.

    ping_interval: segundos entre pings.
    ping_timeout: tiempo en segundos a esperar por el pong antes de cerrar.
    """
    print(f"Iniciando heartbeat: interval={ping_interval}s timeout={ping_timeout}s")
    while True:
        await asyncio.sleep(ping_interval)
        for ws in list(clientes_conectados):
            try:
                # ws.ping() devuelve un awaitable que completa al recibir pong
                pong_waiter = ws.ping()
                await asyncio.wait_for(pong_waiter, timeout=ping_timeout)
            except Exception as e:
                try:
                    print(f"Heartbeat: websocket no responde, cerrando {ws.remote_address}: {e}")
                except Exception:
                    print(f"Heartbeat: websocket no responde, cerrando websocket desconocido: {e}")
                try:
                    await ws.close()
                except Exception:
                    pass
                _cleanup_ws(ws)


async def difundir(mensaje: dict, excluir=None):
    to_remove = []
    for cliente in list(clientes_conectados):
        if cliente == excluir:
            continue
        ok = await envio_seguro(cliente, mensaje)
        if not ok:
            to_remove.append(cliente)
    for c in to_remove:
        if c in clientes_conectados:
            clientes_conectados.remove(c)


async def difundir_canal(mensaje: dict, canal: str, excluir=None):
    """Difundir mensaje sólo a suscriptores de un canal."""
    if not canal:
        return
    to_remove = []
    subs = list(channel_subscriptions.get(canal, set()))
    for cliente in subs:
        if cliente == excluir:
            continue
        ok = await envio_seguro(cliente, mensaje)
        if not ok:
            to_remove.append(cliente)
    for c in to_remove:
        # quitar de clientes_conectados y de la subscripción
        if c in clientes_conectados:
            clientes_conectados.remove(c)
        chans = ws_channels.get(c)
        if chans and canal in chans:
            chans.remove(canal)
        subs_set = channel_subscriptions.get(canal)
        if subs_set and c in subs_set:
            subs_set.remove(c)


def subscribe_channel(ws, canal: str):
    channel_subscriptions.setdefault(canal, set()).add(ws)
    ws_channels.setdefault(ws, set()).add(canal)


def unsubscribe_channel(ws, canal: str):
    subs = channel_subscriptions.get(canal)
    if subs and ws in subs:
        subs.remove(ws)
    chans = ws_channels.get(ws)
    if chans and canal in chans:
        chans.remove(canal)
    if subs is not None and len(subs) == 0:
        channel_subscriptions.pop(canal, None)
    if chans is not None and len(chans) == 0:
        ws_channels.pop(ws, None)


async def notify_channel(canal: str, mensaje: dict, excluir=None):
    await difundir_canal(mensaje, canal, excluir=excluir)


async def poller_realtime(poll_interval: int = 5):

    global last_seen_id
    print(f"Iniciando poller realtime (interval={poll_interval}s). last_seen_id inicial={last_seen_id}")
    while True:
        try:
            resp = supabase.table("producto").select("*").execute()
            rows = getattr(resp, 'data', None) or []
            # Filtrar nuevos por id
            nuevos = []
            for r in rows:
                try:
                    rid = None
                    if pk_column and pk_column in r:
                        rid = int(r.get(pk_column))
                    else:
                        # intentar detectar algún id numérico en la fila
                        for k, v in r.items():
                            try:
                                if isinstance(v, (int, float)) and float(v).is_integer():
                                    rid = int(v)
                                    break
                            except Exception:
                                continue
                except Exception:
                    rid = None
                if rid is not None and rid > last_seen_id:
                    nuevos.append((rid, r))

            if nuevos:
                # ordenar por id ascendente
                nuevos.sort(key=lambda x: x[0])
                for rid, row in nuevos:
                    print(f"Poller: nuevo producto detectado id={rid}")
                    await difundir({"type": "new_product", "data": [row]})
                    last_seen_id = max(last_seen_id, rid)

        except Exception as e:
            print("Error en poller_realtime:", e)
            traceback.print_exc()

        await asyncio.sleep(poll_interval)


async def manejador(ws):
    print(f"Cliente conectado: {ws.remote_address}")
    clientes_conectados.add(ws)
    try:
        async for mensaje in ws:
            print(f"Mensaje recibido de {ws.remote_address}: {repr(mensaje)}")
            raw = sanear_mensaje(mensaje)
            if not raw:
                await envio_seguro(ws, {"error": "Mensaje vacío"})
                continue
            try:
                data = json.loads(raw)
            except Exception as e:
                # Intentar reparar JSON comunes (falta llave inicial/fin, payload entrecomillado, etc.)
                reparado_raw, reparado_obj = intentar_reparar_json(raw)
                if reparado_obj is not None:
                    print("JSON reparado. raw antes:", repr(raw), "-> reparado:", reparado_raw)
                    data = reparado_obj
                else:
                    err = f"JSON inválido: {e}"
                    print(err, "raw repr:", repr(raw))
                    await envio_seguro(ws, {"error": err})
                    continue

            accion = data.get("action")

            # Nuevas acciones: subscribe/unsubscribe/notify/ping
            if accion == "subscribe":
                canal = data.get("channel")
                if not canal:
                    await envio_seguro(ws, {"error": "Falta 'channel' en subscribe"})
                else:
                    subscribe_channel(ws, canal)
                    await envio_seguro(ws, {"type": "subscribed", "channel": canal})
                continue

            if accion == "unsubscribe":
                canal = data.get("channel")
                if not canal:
                    await envio_seguro(ws, {"error": "Falta 'channel' en unsubscribe"})
                else:
                    unsubscribe_channel(ws, canal)
                    await envio_seguro(ws, {"type": "unsubscribed", "channel": canal})
                continue

            if accion == "notify":
                canal = data.get("channel")
                payload = data.get("payload")
                if not canal or payload is None:
                    await envio_seguro(ws, {"error": "Falta 'channel' o 'payload' en notify"})
                else:
                    await notify_channel(canal, {"type": "notification", "channel": canal, "data": payload}, excluir=ws)
                    await envio_seguro(ws, {"type": "notify_ack", "channel": canal})
                continue

            if accion == "ping":
                await envio_seguro(ws, {"type": "pong"})
                continue


            if accion == "get_products":
                try:
                    resp = supabase.table("producto").select("*").execute()
                    await envio_seguro(ws, {"type": "products", "data": resp.data})
                except Exception as e:
                    print("Error al obtener productos:", e)
                    traceback.print_exc()
                    await envio_seguro(ws, {"error": str(e)})

            elif accion == "add_product":
                producto = data.get("product")
                # Logs adicionales para depuración
                print("Producto a insertar (raw):", repr(producto), "tipo:", type(producto))
                # Si el producto vino como string JSON, intentar parsearlo
                if isinstance(producto, str):
                    try:
                        producto = json.loads(producto)
                        print("Producto parseado desde string:", producto)
                    except Exception:
                        print("No se pudo parsear 'product' desde string; intentando insertar tal cual.")

                # Normalizar claves a minúsculas para que coincidan con columnas en la BD (postgrest espera nombres en minúscula)
                try:
                    producto_db = normalize_product_keys(producto)
                    print("Producto normalizado para BD:", producto_db)
                except Exception:
                    producto_db = producto

                try:
                    res = supabase.table("producto").insert(producto_db).execute()
                    # Mostrar la respuesta completa para entender fallos
                    try:
                        # Algunos clientes exponen atributos distintos
                        print("Respuesta insert -> data:", getattr(res, 'data', None), "status_code:", getattr(res, 'status_code', None), "error:", getattr(res, 'error', None))
                    except Exception:
                        print("Respuesta insert (repr):", repr(res))

                    # Manejo de errores según la respuesta
                    # Si res tiene atributo 'error' o no contiene data, avisar
                    insert_data = None
                    if hasattr(res, 'data'):
                        insert_data = res.data

                    if insert_data:
                        await envio_seguro(ws, {"type": "add_product", "status": "success", "data": insert_data})
                        # difundir a los demás
                        await difundir({"type": "new_product", "data": insert_data}, excluir=ws)
                    else:
                        # Enviar detalle de error si existe
                        detalle = getattr(res, 'error', None) or str(res)
                        print("Insert no devolvió datos. detalle:", detalle)
                        await envio_seguro(ws, {"error": "Inserción fallida", "detail": str(detalle)})

                except Exception as e:
                    print("Error al insertar producto (excepción):", e)
                    traceback.print_exc()
                    await envio_seguro(ws, {"error": str(e)})

            else:
                await envio_seguro(ws, {"error": "Acción no reconocida"})

    except Exception as e:
        try:
            addr = ws.remote_address
        except Exception:
            addr = "desconocido"
        print(f"Excepción en manejador para {addr}: {e}")
        traceback.print_exc()
    finally:
        if ws in clientes_conectados:
            clientes_conectados.remove(ws)
        try:
            print(f"Cliente desconectado: {ws.remote_address}")
        except Exception:
            print("Cliente desconectado: (dirección desconocida)")


async def main():
    puerto = int(os.getenv("WEBSOCKET_PORT", "8000"))
    host = os.getenv("WEBSOCKET_HOST", "localhost")
    # Inicializar last_seen_id con el máximo id actual para no reenviar todo el histórico
    global last_seen_id
    try:
        # Intentar detectar la columna PK de la tabla `producto` y el último id
        # 1) Intentar pedir información del esquema vía PostgREST (information_schema no está expuesto por REST, así que hacemos select a * y miramos keys)
        resp = supabase.table("producto").select("*").limit(1).execute()
        rows = getattr(resp, 'data', None) or []
        detected_pk = None
        if rows:
            first = rows[0]
            # Buscar una clave que contenga 'id' y parezca PK: prefer 'idproducto', 'id_producto', 'id'
            for candidate in ['idproducto', 'id_producto', 'id', 'idProducto', 'idProducto'.lower()]:
                if candidate in first:
                    detected_pk = candidate
                    break
            if not detected_pk:
                # buscar cualquier key que empiece o termine con 'id'
                for k in first.keys():
                    if k.lower().startswith('id') or k.lower().endswith('id'):
                        detected_pk = k
                        break

            if detected_pk:
                pk_column = detected_pk
                # ahora obtener max id
                try:
                    # traer todos los ids (puede ser costoso en tablas grandes, por eso limitamos a obtener el max por SQL sería ideal)
                    resp_all = supabase.table("producto").select(pk_column).execute()
                    all_rows = getattr(resp_all, 'data', None) or []
                    max_id = 0
                    for r in all_rows:
                        try:
                            rid = int(r.get(pk_column))
                            if rid > max_id:
                                max_id = rid
                        except Exception:
                            continue
                    last_seen_id = max_id
                    print(f"pk_column detectada: {pk_column}, last_seen_id inicializado a {last_seen_id}")
                except Exception as e:
                    print("Error al obtener max id usando pk_column:", e)
        else:
            print("Tabla producto vacía o sin filas; last_seen_id se queda en 0")
    except Exception as e:
        print("No se pudo inicializar last_seen_id:", e)

    async with websockets.serve(manejador, host, puerto):
        print(f"✅ Servidor WebSocket corriendo en ws://{host}:{puerto}")
        # Lanzar poller en background (backend-only realtime)
        asyncio.create_task(poller_realtime(poll_interval=int(os.getenv('POLL_INTERVAL', '5'))))
        # Lanzar heartbeat para desconectar clientes inactivos
        asyncio.create_task(heartbeat_loop(ping_interval=int(os.getenv('PING_INTERVAL', '10')), ping_timeout=int(os.getenv('PING_TIMEOUT', '5'))))
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())

