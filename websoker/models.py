"""Modelos de datos para WebSocket"""
from dataclasses import dataclass
from typing import Dict, Any, Set, Optional
from datetime import datetime


@dataclass
class Message:
    """Estructura de mensaje WebSocket"""
    action: str
    channel: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    product: Optional[Dict[str, Any]] = None
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Message':
        return cls(
            action=data.get('action'),
            channel=data.get('channel'),
            payload=data.get('payload'),
            product=data.get('product')
        )


@dataclass
class Stats:
    """Estadísticas del servidor"""
    total_clients: int
    total_channels: int
    timestamp: float
    
    def to_dict(self) -> dict:
        return {
            "type": "stats",
            "total_clients": self.total_clients,
            "total_channels": self.total_channels,
            "timestamp": self.timestamp
        }


class ConnectionManager:
    """Gestor de conexiones y canales"""
    
    def __init__(self):
        self.clients: Set = set()
        self.subscriptions: Dict[str, Set] = {}
        self.client_channels: Dict = {}
        self.client_ips: Dict = {}  # websocket -> IP mapping
        self.unique_ips: Set[str] = set()  # IPs únicas conectadas
    
    def add_client(self, ws) -> None:
        """Agrega un cliente conectado"""
        self.clients.add(ws)
        self.client_channels[ws] = set()
        
        # Rastrear IP única
        try:
            ip = ws.remote_address[0] if ws.remote_address else 'unknown'
            self.client_ips[ws] = ip
            self.unique_ips.add(ip)
        except Exception:
            self.client_ips[ws] = 'unknown'
            self.unique_ips.add('unknown')
    
    def remove_client(self, ws) -> None:
        """Remueve un cliente y sus suscripciones"""
        if ws in self.clients:
            self.clients.remove(ws)
        
        # Limpiar IP tracking
        client_ip = self.client_ips.pop(ws, None)
        if client_ip:
            # Solo remover IP si no hay otras conexiones de la misma IP
            ip_still_connected = any(
                ip == client_ip for ip in self.client_ips.values()
            )
            if not ip_still_connected:
                self.unique_ips.discard(client_ip)
        
        # Limpiar suscripciones
        channels = self.client_channels.pop(ws, set())
        for channel in channels:
            if channel in self.subscriptions and ws in self.subscriptions[channel]:
                self.subscriptions[channel].remove(ws)
            
            if not self.subscriptions[channel]:
                del self.subscriptions[channel]
    
    def subscribe(self, ws, channel: str) -> None:
        """Suscribe un cliente a un canal"""
        self.subscriptions.setdefault(channel, set()).add(ws)
        self.client_channels.setdefault(ws, set()).add(channel)
    
    def unsubscribe(self, ws, channel: str) -> None:
        """Desuscribe un cliente de un canal"""
        if channel in self.subscriptions and ws in self.subscriptions[channel]:
            self.subscriptions[channel].remove(ws)
        
        if ws in self.client_channels and channel in self.client_channels[ws]:
            self.client_channels[ws].remove(channel)
        
        if channel in self.subscriptions and not self.subscriptions[channel]:
            del self.subscriptions[channel]
    
    def get_clients(self) -> list:
        """Obtiene lista de clientes conectados"""
        return list(self.clients)
    
    def get_all_clients(self) -> list:
        """Obtiene todos los clientes conectados"""
        return list(self.clients)
    
    def get_clients_count(self) -> int:
        """Obtiene el número total de conexiones (pestañas abiertas)"""
        total_connections = len(self.clients)
        return max(1, total_connections)  # Mínimo 1 para mostrar al menos 1 pestaña
    
    def get_connection_info(self) -> dict:
        """Obtiene información detallada de conexiones para debug"""
        return {
            'total_connections': len(self.clients),
            'unique_ips': len(self.unique_ips),
            'ips': list(self.unique_ips)
        }
    
    def get_channel_subscribers(self, channel: str) -> list:
        """Obtiene suscriptores de un canal"""
        return list(self.subscriptions.get(channel, set()))
    
    def get_stats(self) -> Stats:
        """Obtiene estadísticas del servidor"""
        import asyncio
        # Asegurar que mínimo hay 1 cliente (nosotros)
        client_count = max(1, len(self.clients))
        return Stats(
            total_clients=client_count,
            total_channels=len(self.subscriptions),
            timestamp=asyncio.get_event_loop().time()
        )
