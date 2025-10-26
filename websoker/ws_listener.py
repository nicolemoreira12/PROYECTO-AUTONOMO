
import asyncio
import websockets

async def main():
    uri = "ws://localhost:8000"
    try:
        async with websockets.connect(uri) as ws:
            print("Conectado al servidor WS, esperando mensajes...")
            while True:
                msg = await ws.recv()
                print("RECIBIDO:", msg)
    except Exception as e:
        print("Error en conexión WS:", e)

if __name__ == '__main__':
    asyncio.run(main())
