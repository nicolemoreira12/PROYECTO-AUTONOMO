"""Manejador de mensajes WebSocket"""
import json
from typing import Dict, Any, Optional, Callable
import asyncio
from models import Message
from utils import parse_message, normalize_product


class MessageHandler:
    """Procesa y responde mensajes WebSocket"""
    
    def __init__(self, connection_manager, database_manager):
        self.connections = connection_manager
        self.db = database_manager
        self.handlers: Dict[str, Callable] = {
            'subscribe': self.handle_subscribe,
            'unsubscribe': self.handle_unsubscribe,
            'ping': self.handle_ping,
            'get_products': self.handle_get_products,
            'add_product': self.handle_add_product,
            'notify': self.handle_notify,
        }
    
    async def process_message(self, ws, raw_message: str) -> Optional[Dict[str, Any]]:
        """Procesa un mensaje del cliente"""
        # Parsear mensaje
        success, data = parse_message(raw_message)
        if not success:
            return {'error': 'JSON inválido'}
        
        if not isinstance(data, dict):
            return {'error': 'Mensaje debe ser un objeto JSON'}
        
        # Obtener acción
        action = data.get('action')
        if not action:
            return {'error': 'Falta "action" en el mensaje'}
        
        # Buscar handler
        handler = self.handlers.get(action)
        if not handler:
            return {'error': f'Acción no reconocida: {action}'}
        
        # Ejecutar handler
        try:
            return await handler(ws, data)
        except Exception as e:
            print(f"Error en handler {action}: {e}")
            return {'error': str(e)}
    
    async def handle_subscribe(self, ws, data: dict) -> dict:
        """Maneja suscripción a canal"""
        channel = data.get('channel')
        if not channel:
            return {'error': 'Falta "channel"'}
        
        self.connections.subscribe(ws, channel)
        print(f"Cliente suscrito al canal: {channel}")
        return {'type': 'subscribed', 'channel': channel}
    
    async def handle_unsubscribe(self, ws, data: dict) -> dict:
        """Maneja desuscripción de canal"""
        channel = data.get('channel')
        if not channel:
            return {'error': 'Falta "channel"'}
        
        self.connections.unsubscribe(ws, channel)
        print(f"Cliente desuscrito del canal: {channel}")
        return {'type': 'unsubscribed', 'channel': channel}
    
    async def handle_ping(self, ws, data: dict) -> dict:
        """Responde a ping"""
        return {'type': 'pong'}
    
    async def handle_get_products(self, ws, data: dict) -> dict:
        """Obtiene todos los productos"""
        products = self.db.get_all_products()
        if products is None:
            return {'error': 'Error accediendo a la base de datos'}
        
        print(f"Enviando {len(products)} productos")
        return {'type': 'products', 'data': products}
    
    async def handle_add_product(self, ws, data: dict) -> dict:
        """Crea un nuevo producto"""
        product = data.get('product')
        if not product:
            return {'error': 'Falta "product"'}
        
        if isinstance(product, str):
            try:
                product = json.loads(product)
            except json.JSONDecodeError:
                return {'error': 'Campo "product" no es JSON válido'}
        
        # Normalizar producto
        normalized = normalize_product(product)
        if not normalized:
            return {'error': 'Producto vacío después de normalización'}
        
        # Crear en BD
        created = self.db.create_product(normalized)
        if not created:
            return {'error': 'Error creando producto en BD'}
        
        print(f"Producto creado: {created.get('nombreProducto')}")
        return {
            'type': 'add_product',
            'status': 'success',
            'data': [created]
        }
    
    async def handle_notify(self, ws, data: dict) -> dict:
        """Notifica a un canal"""
        channel = data.get('channel')
        payload = data.get('payload')
        
        if not channel or payload is None:
            return {'error': 'Falta "channel" o "payload"'}
        
        await self._broadcast_to_channel(
            channel,
            {'type': 'notification', 'channel': channel, 'data': payload},
            exclude_client=ws
        )
        
        return {'type': 'notify_ack', 'channel': channel}
    
    async def _broadcast_to_channel(self, channel: str, message: dict, exclude_client=None) -> None:
        """Envía mensaje a todos los suscriptores de un canal"""
        subscribers = self.connections.get_channel_subscribers(channel)
        for client in subscribers:
            if client != exclude_client:
                await self._send_safe(client, message)
    
    @staticmethod
    async def _send_safe(ws, message: dict) -> bool:
        """Envía mensaje de forma segura"""
        try:
            await ws.send(json.dumps(message))
            return True
        except Exception as e:
            print(f"Error enviando mensaje: {e}")
            return False
