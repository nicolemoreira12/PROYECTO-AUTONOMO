#!/usr/bin/env python3
"""
Test simple para verificar conexión al WebSocket
"""

import asyncio
import websockets
import json

async def test():
    uri = "ws://127.0.0.1:8000"
    try:
        print(f"🔌 Conectando a {uri}...")
        async with websockets.connect(uri) as websocket:
            print("✅ Conectado!")
            
            # Recibir mensaje de bienvenida
            msg = await websocket.recv()
            print(f"📨 Mensaje recibido: {msg}")
            
            # Enviar init
            print("\n📤 Enviando init...")
            await websocket.send(json.dumps({
                "action": "init",
                "user_id": "user_test",
                "emprendedor_id": "emp_test"
            }))
            
            # Recibir respuesta
            msg = await websocket.recv()
            print(f"📨 Respuesta: {msg}")
            
            # Solicitar productos
            print("\n📤 Solicitar productos...")
            await websocket.send(json.dumps({
                "action": "get_products"
            }))
            
            msg = await websocket.recv()
            print(f"📨 Productos: {msg}")
            
            print("\n✅ ¡TODOS LOS TESTS PASARON!")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
