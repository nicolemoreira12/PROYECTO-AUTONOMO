
import asyncio
import websockets
import os


async def main():
    host = os.getenv('WEBSOCKET_HOST', 'localhost')
    port = os.getenv('WEBSOCKET_PORT', '8002')
    uri = f"ws://{host}:{port}"
    async with websockets.connect(uri) as ws:
        msg = {"action": "add_product", "product": {"idvendedor": 1, "nombreproducto": "Prueba WS", "descripcion": "Descripción de prueba", "precio": 100.0, "stock": 5, "categoria": "demo", "imagenurl": "https://example.com/img.jpg"}}
        await ws.send(str(msg))
        try:
            resp = await ws.recv()
            print('Respuesta del servidor:', resp)
        except Exception:
            pass


if __name__ == '__main__':
    asyncio.run(main())
