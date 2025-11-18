
import os
import asyncio
import websockets
import json
import traceback
from decimal import Decimal
from config import get_db_connection
from psycopg2.extras import RealDictCursor

clientes_conectados = set()
channel_subscriptions = {}
ws_channels = {}

last_seen_id = 0
pk_column = None
db_conn = None


def sanear_mensaje(raw):
    try:
        raw = raw.replace("\x00", "")
    except Exception:
        raw = str(raw)
    if isinstance(raw, str) and raw.startswith('(Text):'):
        idx = raw.find('\r\n')
        if idx == -1:
            idx = raw.find('\n')
        if idx != -1:
            raw = raw[idx+2:]
        else:
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

    if not cand.startswith('{') and ('"action"' in cand or "'action'" in cand):
        cand2 = '{' + cand
        if not cand2.endswith('}'):
            cand2 = cand2 + '}'
        try:
            obj = json.loads(cand2)
            return cand2, obj
        except Exception:
            pass

    opens = cand.count('{')
    closes = cand.count('}')
    if opens > closes:
        cand2 = cand + ('}' * (opens - closes))
        try:
            obj = json.loads(cand2)
            return cand2, obj
        except Exception:
            pass

    if (cand.startswith('"') and cand.endswith('"')) or (cand.startswith("'") and cand.endswith("'")):
        inner = cand[1:-1]
        try:
            obj = json.loads(inner)
            return inner, obj
        except Exception:
            maybe = '{' + inner + '}'
            try:
                obj = json.loads(maybe)
                return maybe, obj
            except Exception:
                pass

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
    # Mapear campos del cliente a columnas de DB
    mapping = {
        'nombre': 'nombreProducto',
        'nombreproducto': 'nombreProducto',
        'descripcion': 'descripcion',
        'precio': 'precio',
        'stock': 'stock',
        'imagenurl': 'imagenURL',
        'emprendedoridemrendedor': 'emprendedorIdEmprendedor',
        'categoriaidcategoria': 'categoriaIdCategoria'
    }
    normalized = {}
    for k, v in product.items():
        key_lower = str(k).lower()
        mapped_key = mapping.get(key_lower, key_lower)
        normalized[mapped_key] = v
    return normalized


def convertir_para_json(obj):
    """Convierte objetos no serializables (como Decimal) a tipos JSON compatibles"""
    if isinstance(obj, dict):
        return {k: convertir_para_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convertir_para_json(item) for item in obj]
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj


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
    print(f"Iniciando heartbeat: interval={ping_interval}s timeout={ping_timeout}s")
    while True:
        await asyncio.sleep(ping_interval)
        for ws in list(clientes_conectados):
            try:
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
            if db_conn:
                try:
                    cur = db_conn.cursor(cursor_factory=RealDictCursor)
                    cur.execute("SELECT * FROM producto ORDER BY \"idProducto\" DESC LIMIT 100")
                    rows = cur.fetchall()
                    nuevos = []
                    for r in rows:
                        try:
                            rid = r.get('idProducto') or r.get('id')
                            if rid and int(rid) > last_seen_id:
                                nuevos.append((int(rid), convertir_para_json(dict(r))))
                        except Exception:
                            continue

                    if nuevos:
                        nuevos.sort(key=lambda x: x[0])
                        for rid, row in nuevos:
                            print(f"Poller: nuevo producto detectado id={rid}")
                            await difundir({"type": "new_product", "data": [row]})
                            last_seen_id = max(last_seen_id, rid)
                except Exception as e:
                    if "transaction is aborted" in str(e):
                        db_conn.rollback()
                    elif "does not exist" not in str(e):
                        print(f"Error en poller_realtime: {str(e)[:100]}")
                    else:
                        db_conn.rollback()  # Siempre rollback para limpiar estado

        except Exception as e:
            if "does not exist" not in str(e):
                print(f"Error en poller_realtime (outer): {str(e)[:100]}")

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
                    if db_conn:
                        try:
                            cur = db_conn.cursor(cursor_factory=RealDictCursor)
                            cur.execute("SELECT * FROM producto")
                            productos = cur.fetchall()
                            datos = [convertir_para_json(dict(row)) for row in productos]
                            await envio_seguro(ws, {"type": "products", "data": datos})
                        except Exception as e:
                            db_conn.rollback()  # Limpiar transacción
                            raise
                    else:
                        await envio_seguro(ws, {"error": "No hay conexión a base de datos"})
                except Exception as e:
                    print(f"Error get_products: {str(e)[:100]}")
                    await envio_seguro(ws, {"error": "Error al obtener productos", "detail": str(e)[:200]})
                continue

            if accion == "add_product":
                producto = data.get("product")
                print("Producto a insertar (raw):", repr(producto), "tipo:", type(producto))
                if isinstance(producto, str):
                    try:
                        producto = json.loads(producto)
                        print("Producto parseado desde string:", producto)
                    except Exception:
                        print("No se pudo parsear 'product' desde string")

                try:
                    producto_db = normalize_product_keys(producto)
                    print("Producto normalizado:", producto_db)
                    
                    # Agregar valores por defecto para columnas NOT NULL faltantes
                    if 'imagenURL' not in producto_db:
                        producto_db['imagenURL'] = ''
                    if 'stock' not in producto_db:
                        producto_db['stock'] = 1

                    if db_conn:
                        try:
                            cur = db_conn.cursor(cursor_factory=RealDictCursor)
                            cols = ", ".join(f'"{k}"' for k in producto_db.keys())  # Quoting para camelCase
                            vals = ", ".join(["%s"] * len(producto_db))
                            sql = f"INSERT INTO producto ({cols}) VALUES ({vals}) RETURNING *"
                            print(f"SQL: {sql}")
                            cur.execute(sql, tuple(producto_db.values()))
                            db_conn.commit()
                            resultado = cur.fetchone()
                            datos = [convertir_para_json(dict(resultado))] if resultado else []
                            
                            if datos:
                                await envio_seguro(ws, {"type": "add_product", "status": "success", "data": datos})
                                await difundir({"type": "new_product", "data": datos}, excluir=ws)
                            else:
                                await envio_seguro(ws, {"error": "No se pudo insertar el producto"})
                        except Exception as e:
                            db_conn.rollback()  # Limpiar transacción en error
                            raise
                    else:
                        await envio_seguro(ws, {"error": "No hay conexión a base de datos"})

                except Exception as e:
                    print(f"Error add_product: {e}")
                    traceback.print_exc()
                    await envio_seguro(ws, {"error": f"Error al insertar: {str(e)[:200]}"})

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
    global db_conn
    puerto = int(os.getenv("WEBSOCKET_PORT", "8000"))
    host = os.getenv("WEBSOCKET_HOST", "localhost")
    
    db_conn = get_db_connection()
    
    global last_seen_id
    try:
        if db_conn:
            cur = db_conn.cursor()
            cur.execute("SELECT MAX(\"idProducto\") FROM producto")
            max_id = cur.fetchone()[0] or 0
            last_seen_id = int(max_id)
            print(f"✅ last_seen_id inicializado a {last_seen_id} desde PostgreSQL")
    except Exception as e:
        print(f"Error inicializando last_seen_id: {e}")

    async with websockets.serve(manejador, host, puerto):
        print(f"✅ Servidor WebSocket corriendo en ws://{host}:{puerto}")
        asyncio.create_task(poller_realtime(poll_interval=int(os.getenv('POLL_INTERVAL', '5'))))
        asyncio.create_task(heartbeat_loop(ping_interval=int(os.getenv('PING_INTERVAL', '10')), ping_timeout=int(os.getenv('PING_TIMEOUT', '5'))))
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
