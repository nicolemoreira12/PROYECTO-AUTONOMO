#!/usr/bin/env python3
"""
Servidor WebSocket SIMPLE para testing - Sin Supabase
"""

import asyncio
import websockets
import json
import logging
import uuid
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Almacenamiento en memoria
clients = {}
channels = {}

class ClientConnection:
    def __init__(self, ws, client_id):
        self.ws = ws
        self.client_id = client_id
        self.user_id = None
        self.emprendedor_id = None
        self.channels = set()
        self.connected_at = datetime.now()

async def handle_client(websocket):
    """Manejar conexión de cliente"""
    client_id = str(uuid.uuid4())[:8]
    client = ClientConnection(websocket, client_id)
    clients[client_id] = client
    
    logger.info(f"✅ Cliente conectado: {client_id}")
    
    # Enviar mensaje de bienvenida
    await websocket.send(json.dumps({
        "type": "connection:established",
        "client_id": client_id,
        "timestamp": datetime.now().isoformat()
    }))
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                action = data.get("action")
                
                logger.info(f"📨 {client_id} - Acción: {action}")
                
                # Procesar acciones
                if action == "init":
                    client.user_id = data.get("user_id")
                    client.emprendedor_id = data.get("emprendedor_id")
                    
                    await websocket.send(json.dumps({
                        "type": "init:success",
                        "client_id": client_id,
                        "user_id": client.user_id,
                        "emprendedor_id": client.emprendedor_id
                    }))
                    logger.info(f"✅ {client_id} inicializado")
                
                elif action == "subscribe":
                    channel = data.get("channel")
                    client.channels.add(channel)
                    
                    if channel not in channels:
                        channels[channel] = set()
                    channels[channel].add(client_id)
                    
                    await websocket.send(json.dumps({
                        "type": "subscribe:success",
                        "channel": channel,
                        "channels": list(client.channels)
                    }))
                    logger.info(f"✅ {client_id} suscrito a: {channel}")
                
                elif action == "ping":
                    await websocket.send(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    }))
                
                elif action == "get_stats":
                    await websocket.send(json.dumps({
                        "type": "stats",
                        "total_clients": len(clients),
                        "total_channels": len(channels),
                        "channels": list(channels.keys())
                    }))
                
                elif action == "send_message":
                    msg_data = data.get("data", {})
                    response = {
                        "type": "message:received",
                        "from": client_id,
                        "data": msg_data,
                        "timestamp": datetime.now().isoformat()
                    }
                    await websocket.send(json.dumps(response))
                    logger.info(f"✅ Mensaje enviado desde {client_id}")
                
                else:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": f"Acción desconocida: {action}"
                    }))
            
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": "JSON inválido"
                }))
            except Exception as e:
                logger.error(f"❌ Error procesando mensaje: {e}")
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": str(e)
                }))
    
    except asyncio.CancelledError:
        pass
    except Exception as e:
        logger.error(f"❌ Error en cliente {client_id}: {e}")
    
    finally:
        # Limpiar cliente
        if client_id in clients:
            del clients[client_id]
        
        # Limpiar canales
        for channel, client_ids in list(channels.items()):
            client_ids.discard(client_id)
            if not client_ids:
                del channels[channel]
        
        logger.info(f"❌ Cliente desconectado: {client_id}")

async def main():
    host = "0.0.0.0"
    port = 8000
    
    logger.info(f"🚀 Iniciando servidor WebSocket en ws://{host}:{port}")
    
    async with websockets.serve(handle_client, host, port):
        logger.info(f"✅ Servidor WebSocket corriendo en ws://{host}:{port}")
        try:
            await asyncio.Future()  # run forever
        except KeyboardInterrupt:
            logger.info("🛑 Servidor detenido")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Servidor cerrado")
