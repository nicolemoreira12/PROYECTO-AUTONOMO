
import os
import asyncio
import websockets
import json
from typing import Optional

from models import ConnectionManager
from database import DatabaseManager
from handlers import MessageHandler
from background import BackgroundTasks


class WebSocketServer:
    """Servidor WebSocket principal"""
    
    def __init__(self):
        self.host = os.getenv('WEBSOCKET_HOST', 'localhost')
        self.port = int(os.getenv('WEBSOCKET_PORT', '8000'))
        self.ping_interval = int(os.getenv('PING_INTERVAL', '10'))
        self.ping_timeout = int(os.getenv('PING_TIMEOUT', '5'))
        self.poll_interval = int(os.getenv('POLL_INTERVAL', '5'))
        self.stats_interval = 2
        
        self.connections = ConnectionManager()
        self.database = DatabaseManager()
        self.message_handler = MessageHandler(self.connections, self.database)
        self.background = BackgroundTasks(self.connections, self.database)
    
    async def client_handler(self, ws) -> None:
        """Maneja un cliente conectado"""
        try:
            # Agregar cliente
            self.connections.add_client(ws)
            ip = ws.remote_address[0] if ws.remote_address else 'unknown'
            print(f"✅ Cliente conectado: {ip} (puerto: {ws.remote_address[1] if ws.remote_address else 'unknown'})")
            
            # Notificar cambio de estado
            try:
                await self._broadcast_stats()
            except Exception:
                pass
            
            # Procesar mensajes
            async for message in ws:
                try:
                    response = await self.message_handler.process_message(ws, message)
                    
                    if response:
                        await self._send_safe(ws, response)
                        
                        # Si es un add_product exitoso, notificar a otros
                        if response.get('type') == 'add_product' and response.get('status') == 'success':
                            await self._broadcast_new_product(response.get('data', []))
                except Exception as e:
                    print(f"⚠️ Error procesando mensaje: {e}")
                    try:
                        await self._send_safe(ws, {'error': str(e)})
                    except Exception:
                        pass
        
        except websockets.exceptions.ConnectionClosed:
            ip = ws.remote_address[0] if ws.remote_address else 'unknown'
            print(f"👋 Cliente desconectado normalmente: {ip}")
        except Exception as e:
            print(f"❌ Error en client_handler: {e}")
        
        finally:
            # Limpiar cliente
            self.connections.remove_client(ws)
            ip = ws.remote_address[0] if ws.remote_address else 'unknown'
            print(f"🧹 Cliente limpiado: {ip}")
            
            # Notificar cambio de estado
            try:
                await self._broadcast_stats()
            except Exception:
                pass
    
    async def start(self) -> None:
        """Inicia el servidor"""
        # Conectar a BD
        if not self.database.connect():
            print("❌ No se puede conectar a la base de datos")
            return
        
        print(f"\n{'='*60}")
        print(f"🚀 WebSocket Server iniciado")
        print(f"   URL: ws://{self.host}:{self.port}")
        print(f"   Heartbeat: {self.ping_interval}s")
        print(f"   Product Poll: {self.poll_interval}s")
        print(f"   Stats Broadcast: {self.stats_interval}s")
        print(f"{'='*60}\n")
        
        # Iniciar tareas en background como tareas separadas
        asyncio.create_task(self.background.heartbeat_loop(
            interval=self.ping_interval,
            timeout=self.ping_timeout
        ))
        asyncio.create_task(self.background.stats_broadcast_loop(
            interval=self.stats_interval
        ))
        asyncio.create_task(self.background.product_poller_loop(
            interval=self.poll_interval
        ))
        
        # Iniciar servidor WebSocket
        async with websockets.serve(self.client_handler, self.host, self.port):
            # Mantener el servidor vivo indefinidamente
            await asyncio.sleep(float('inf'))
    
    async def _send_safe(self, ws, message: dict) -> bool:
        """Envía mensaje de forma segura"""
        try:
            await ws.send(json.dumps(message))
            return True
        except Exception as e:
            print(f"⚠️ Error enviando mensaje a {ws.remote_address}: {e}")
            return False
    
    async def _broadcast_stats(self) -> None:
        """Envía estadísticas a todos"""
        try:
            client_count = self.connections.get_clients_count()
            clients = self.connections.get_clients()
            
            message = {
                'type': 'clients_count',
                'data': {
                    'count': client_count,
                    'clientsOnline': client_count,
                    'timestamp': str(asyncio.get_event_loop().time())
                }
            }
            
            if clients:
                for client in clients:
                    try:
                        await self._send_safe(client, message)
                    except Exception:
                        pass
        except Exception as e:
            print(f"⚠️ Error broadcast stats: {e}")
    
    async def _broadcast_new_product(self, products: list) -> None:
        """Notifica a todos sobre nuevo producto"""
        try:
            clients = self.connections.get_clients()
            
            if clients:
                for client in clients:
                    try:
                        await self._send_safe(client, {
                            'type': 'new_product',
                            'data': products
                        })
                    except Exception:
                        pass
        except Exception as e:
            print(f"⚠️ Error broadcast product: {e}")


async def main():
    """Punto de entrada"""
    server = WebSocketServer()
    await server.start()


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"Error: {e}")
