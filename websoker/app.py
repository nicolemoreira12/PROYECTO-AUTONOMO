# -*- coding: utf-8 -*-
import asyncio
import websockets
import json
import traceback
from config import supabase

connected_clients = set()

async def handler(websocket):
    # Nuevo cliente conectado
    print(f"Cliente conectado: {websocket.remote_address}")
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            print(f"Mensaje recibido de {websocket.remote_address}: {message}")
            try:
                data = json.loads(message)
            except Exception as e:
                err = f"JSON inválido: {e}"
                print(err)
                await websocket.send(json.dumps({"error": err}))
                continue

            action = data.get("action")

            if action == "get_products":
                try:
                    response = supabase.table("producto").select("*").execute()
                    await websocket.send(json.dumps({
                        "type": "products",
                        "data": response.data
                    }))
                except Exception as e:
                    print("Error al obtener productos:", e)
                    traceback.print_exc()
                    await websocket.send(json.dumps({"error": str(e)}))

            elif action == "add_product":
                product = data.get("product")
                try:
                    result = supabase.table("producto").insert(product).execute()
                    await websocket.send(json.dumps({
                        "type": "add_product",
                        "status": "success",
                        "data": result.data
                    }))

                    # Notificar a los demás clientes
                    for client in connected_clients.copy():
                        if client != websocket:
                            try:
                                await client.send(json.dumps({
                                    "type": "new_product",
                                    "data": result.data
                                }))
                            except Exception as send_err:
                                print(f"Error al notificar a cliente {client.remote_address}: {send_err}")
                except Exception as e:
                    # Capturar error de inserción y devolver detalle al cliente
                    print("Error al insertar producto:", e)
                    traceback.print_exc()
                    await websocket.send(json.dumps({"error": str(e)}))

            else:
                await websocket.send(json.dumps({"error": "Acción no reconocida"}))

    except Exception as e:
        print(f"Excepción en handler para {websocket.remote_address}: {e}")
        traceback.print_exc()
    finally:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
        print(f"Cliente desconectado: {websocket.remote_address}")

async def main():
    async with websockets.serve(handler, "localhost", 8000):
        print("✅ Servidor WebSocket corriendo en ws://localhost:8000")
        await asyncio.Future()  # Mantiene el servidor corriendo

if __name__ == "__main__":
    asyncio.run(main())
