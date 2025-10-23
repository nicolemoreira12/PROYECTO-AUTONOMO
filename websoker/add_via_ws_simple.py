
import asyncio
import websockets
import json

WS_URL = "ws://localhost:8001" 

async def main():
    async with websockets.connect(WS_URL) as ws:
        payload = {
            "action": "add_product",
            "product": {
                "idVendedor": 1,
                "nombreProducto": "Producto desde WS",
                "descripcion": "Prueba desde websocket",
                "precio": 12.5,
                "stock": 3
            }
        }
        print("Enviando:", payload)
        await ws.send(json.dumps(payload))
        # Esperar respuesta del servidor
        resp = await ws.recv()
        print("Respuesta del servidor:", resp)

if __name__ == '__main__':
    asyncio.run(main())
