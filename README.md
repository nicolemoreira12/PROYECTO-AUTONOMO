# PROYECTO-AUTONOMO

Este repositorio contiene un backend WebSocket y scripts de prueba para un marketplace.

Carpetas importantes:
- `websoker/`: servidor WebSocket y scripts relacionados.
- `websoker/scripts/`: scripts de prueba (envío WS, inserciones demo).

Resumen rápido de cómo arrancar el backend en desarrollo:

1. Abrir PowerShell en la raíz del proyecto.
2. Activar el virtualenv (si existe):

& .\.venv\Scripts\Activate.ps1

3. Ir a la carpeta `websoker` y ejecutar:

$env:WEBSOCKET_PORT='8002'; & .\.venv\Scripts\python.exe .\app.py

4. Para pruebas:
- Listener: & .\.venv\Scripts\python.exe .\ws_listener.py
- Insert demo: & .\.venv\Scripts\python.exe .\create_emprendedor_demo.py
- Enviar add via WS: & .\.venv\Scripts\python.exe .\scripts\add_via_ws_simple.py

