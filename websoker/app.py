
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
            print(f"Cliente conectado: {ws.remote_address}")
            
            # Notificar cambio de estado
            await self._broadcast_stats()
            
            # Procesar mensajes
            async for message in ws:
                response = await self.message_handler.process_message(ws, message)
                
                if response:
                    await self._send_safe(ws, response)
                    
                    # Si es un add_product exitoso, notificar a otros
                    if response.get('type') == 'add_product' and response.get('status') == 'success':
                        await self._broadcast_new_product(response.get('data', []))
        
        except websockets.exceptions.ConnectionClosed:
            print(f"Cliente desconectado: {ws.remote_address}")
        except Exception as e:
            print(f"Error en client_handler: {e}")
        
        finally:
            # Limpiar cliente
            self.connections.remove_client(ws)
            print(f"Cliente limpiado: {ws.remote_address}")
            
            # Notificar cambio de estado
            await self._broadcast_stats()
    
    async def start(self) -> None:
        """Inicia el servidor"""
        # Conectar a BD
        if not self.database.connect():
            print("No se puede conectar a la base de datos")
            return
        
        # Crear tareas en segundo plano
        tasks = [
            asyncio.create_task(self.background.heartbeat_loop(
                interval=self.ping_interval,
                timeout=self.ping_timeout
            )),
            asyncio.create_task(self.background.stats_broadcast_loop(
                interval=self.stats_interval
            )),
            asyncio.create_task(self.background.product_poller_loop(
                interval=self.poll_interval
            )),
        ]
        
        # Iniciar servidor WebSocket
        async with websockets.serve(self.client_handler, self.host, self.port):
            print(f"\n{'='*60}")
            print(f"WebSocket Server iniciado")
            print(f"   URL: ws://{self.host}:{self.port}")
            print(f"   Heartbeat: {self.ping_interval}s")
            print(f"   Product Poll: {self.poll_interval}s")
            print(f"   Stats Broadcast: {self.stats_interval}s")
            print(f"{'='*60}\n")
            
            # Esperar indefinidamente
            try:
                await asyncio.Future()
            except KeyboardInterrupt:
                print("\nApagando servidor...")
                for task in tasks:
                    task.cancel()
                self.database.close()
    
    async def _send_safe(self, ws, message: dict) -> bool:
        """Envía mensaje de forma segura"""
        try:
            await ws.send(json.dumps(message))
            return True
        except Exception as e:
            print(f"Error enviando mensaje a {ws.remote_address}: {e}")
            return False
    
    async def _broadcast_stats(self) -> None:
        """Envía estadísticas a todos"""
        stats = self.connections.get_stats()
        clients = self.connections.get_clients()
        
        for client in clients:
            await self._send_safe(client, stats.to_dict())
    
    async def _broadcast_new_product(self, products: list) -> None:
        """Notifica a todos sobre nuevo producto"""
        clients = self.connections.get_clients()
        
        for client in clients:
            await self._send_safe(client, {
                'type': 'new_product',
                'data': products
            })


async def main():
    """Punto de entrada"""
    server = WebSocketServer()
    await server.start()


if __name__ == '__main__':
    asyncio.run(main())
