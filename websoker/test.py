#!/usr/bin/env python3
"""
Test del WebSocket Server
Ejecutar: python test.py
"""
import asyncio
import websockets
import json

async def test_websocket():
    """Test básico del servidor WebSocket"""
    
    uri = "ws://localhost:8000"
    print(f"\n{'='*60}")
    print(f"WebSocket Server Test")
    print(f"{'='*60}\n")
    
    try:
        async with websockets.connect(uri) as ws:
            print(f"Conectado a {uri}\n")
            
            # Test 1: Ping
            print("Test 1: Ping/Pong")
            await ws.send(json.dumps({"action": "ping"}))
            response = await ws.recv()
            print(f"   Respuesta: {response}\n")
            
            # Test 2: Get Products
            print("Test 2: Obtener Productos")
            await ws.send(json.dumps({"action": "get_products"}))
            response = await ws.recv()
            data = json.loads(response)
            print(f"   Tipo: {data.get('type')}")
            print(f"   Productos: {len(data.get('data', []))}\n")
            
            # Test 3: Subscribe
            print("Test 3: Suscribirse a Canal")
            await ws.send(json.dumps({"action": "subscribe", "channel": "productos"}))
            response = await ws.recv()
            print(f"   Respuesta: {response}\n")
            
            # Escuchar stats por 5 segundos
            print("Test 4: Escuchar Stats (5 segundos)")
            try:
                for i in range(5):
                    response = await asyncio.wait_for(ws.recv(), timeout=1.5)
                    data = json.loads(response)
                    if data.get('type') == 'stats':
                        print(f"   [{i+1}] Clientes: {data.get('total_clients')}, "
                              f"Canales: {data.get('total_channels')}")
            except asyncio.TimeoutError:
                print("   (Sin stats en último intento)")
            
            print("\nTodos los tests completados!")
    
    except ConnectionRefusedError:
        print(f"No se puede conectar a {uri}")
        print("   El servidor esta corriendo?")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    try:
        asyncio.run(test_websocket())
    except KeyboardInterrupt:
        print("\nTest interrumpido")
