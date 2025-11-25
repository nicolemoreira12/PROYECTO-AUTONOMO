#!/usr/bin/env python3
"""
Diagnóstico del WebSocket Server
Verifica que todo esté instalado y configurado correctamente
Ejecutar: python diagnose.py
"""
import sys
import os
import importlib

print("\n" + "="*60)
print("WebSocket Server - Diagnostico")
print("="*60 + "\n")

# Verificar Python version
print("Python:")
print(f"   Version: {sys.version}")
print(f"   Path: {sys.executable}\n")

# Verificar modulos
print("Modulos Requeridos:")
modules_to_check = [
    'websockets',
    'psycopg2',
    'asyncio',
    'json'
]

all_ok = True
for module in modules_to_check:
    try:
        importlib.import_module(module)
        print(f"   OK - {module}")
    except ImportError:
        print(f"   FALLO - {module} - NO INSTALADO")
        all_ok = False

# Verificar archivos del proyecto
print("\nArchivos del Proyecto:")
files_to_check = [
    'app.py',
    'models.py',
    'database.py',
    'handlers.py',
    'background.py',
    'utils.py',
    'config.py',
    'run.py',
    'test.py'
]

for file in files_to_check:
    if os.path.exists(file):
        print(f"   OK - {file}")
    else:
        print(f"   FALLO - {file} - NO ENCONTRADO")
        all_ok = False

# Verificar variables de entorno
print("\nVariables de Entorno:")
env_vars = [
    'WEBSOCKET_HOST',
    'WEBSOCKET_PORT',
    'WEBSOCKET_USER',
    'WEBSOCKET_PASSWORD',
    'WEBSOCKET_DATABASE',
    'WEBSOCKET_HOST_DB'
]

for var in env_vars:
    value = os.getenv(var, 'No configurado')
    if var.endswith('PASSWORD'):
        value = '***' if value != 'No configurado' else value
    print(f"   {var}: {value}")

# Intentar importar modulos locales
print("\nModulos Locales:")
local_modules = [
    'app',
    'models',
    'database',
    'handlers',
    'background',
    'utils',
    'config'
]

for module in local_modules:
    try:
        importlib.import_module(module)
        print(f"   OK - {module}")
    except Exception as e:
        print(f"   FALLO - {module}: {str(e)[:50]}")
        all_ok = False

# Resultado final
print("\n" + "="*60)
if all_ok:
    print("Sistema listo para iniciar servidor")
    print("\nPara iniciar: python run.py")
else:
    print("Hay problemas de configuracion")
    print("\nInstale dependencias con: pip install websockets psycopg2-binary")

print("="*60 + "\n")
