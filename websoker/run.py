#!/usr/bin/env python3
"""
Script para ejecutar el WebSocket Server con configuración
Ejecutar: python run.py
"""
import os
import sys
import subprocess

# Configurar variables de entorno (valores por defecto)
os.environ.setdefault('WEBSOCKET_HOST', 'localhost')
os.environ.setdefault('WEBSOCKET_PORT', '8000')
os.environ.setdefault('PING_INTERVAL', '10')
os.environ.setdefault('PING_TIMEOUT', '5')
os.environ.setdefault('POLL_INTERVAL', '5')

def main():
    print("\n" + "="*60)
    print("WebSocket Server - Iniciando...")
    print("="*60)
    print("\nConfiguracion:")
    print(f"   Host: {os.getenv('WEBSOCKET_HOST')}")
    print(f"   Puerto: {os.getenv('WEBSOCKET_PORT')}")
    print(f"   Heartbeat: {os.getenv('PING_INTERVAL')}s")
    print(f"   Product Poll: {os.getenv('POLL_INTERVAL')}s")
    print("\n")
    
    try:
        import app
        import asyncio
        
        # Ejecutar servidor
        server = app.WebSocketServer()
        asyncio.run(server.start())
    
    except KeyboardInterrupt:
        print("\nServidor detenido por usuario")
        sys.exit(0)
    except Exception as e:
        print(f"\nError fatal: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
