"""Bucles de tareas en segundo plano"""
import asyncio
import json
from typing import List


class BackgroundTasks:
    """Gestor de tareas en segundo plano"""
    
    def __init__(self, connections, database):
        self.connections = connections
        self.db = database
    
    async def heartbeat_loop(self, interval: int = 10, timeout: int = 5) -> None:
        """Monitorea conexiones con heartbeat"""
        print(f"Iniciando heartbeat (interval={interval}s, timeout={timeout}s)")
        while True:
            await asyncio.sleep(interval)
            clients = self.connections.get_clients()
            disconnected = []
            
            for ws in clients:
                try:
                    pong = await asyncio.wait_for(ws.ping(), timeout=timeout)
                    await pong
                except asyncio.TimeoutError:
                    print(f"Heartbeat timeout para {ws.remote_address}")
                    disconnected.append(ws)
                except Exception as e:
                    print(f"Heartbeat error: {e}")
                    disconnected.append(ws)
            
            # Limpiar clientes desconectados
            for ws in disconnected:
                try:
                    await ws.close()
                except Exception:
                    pass
                self.connections.remove_client(ws)
    
    async def stats_broadcast_loop(self, interval: int = 2) -> None:
        """Envía estadísticas periódicamente"""
        print(f"Iniciando broadcast de stats (interval={interval}s)")
        while True:
            await asyncio.sleep(interval)
            stats = self.connections.get_stats()
            await self._broadcast_all(stats.to_dict())
    
    async def product_poller_loop(self, interval: int = 5) -> None:
        """Detecta nuevos productos periódicamente"""
        print(f"Iniciando product poller (interval={interval}s)")
        while True:
            await asyncio.sleep(interval)
            new_products = self.db.get_new_products()
            
            if new_products:
                print(f"✨ {len(new_products)} producto(s) nuevo(s) detectado(s)")
                for product in new_products:
                    await self._broadcast_all({
                        'type': 'new_product',
                        'data': [product]
                    })
    
    async def _broadcast_all(self, message: dict) -> None:
        """Envía mensaje a todos los clientes"""
        clients = self.connections.get_clients()
        disconnected = []
        
        for client in clients:
            try:
                await client.send(json.dumps(message))
            except Exception as e:
                print(f"Error broadcast: {e}")
                disconnected.append(client)
        
        # Limpiar desconectados
        for client in disconnected:
            self.connections.remove_client(client)
