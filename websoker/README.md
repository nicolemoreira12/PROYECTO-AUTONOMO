# Websoker backend

Instrucciones rápidas para desarrollo (PowerShell):

1. Activar entorno virtual:

$env:VENV_PATH=".venv"; & .\$env:VENV_PATH\Scripts\Activate.ps1

2. Configurar variables de entorno (usar `.env` o exportarlas):

$env:WEBSOCKET_HOST='localhost'
$env:WEBSOCKET_PORT='8002'
$env:SUPABASE_URL='https://<your-project>.supabase.co'
$env:SUPABASE_KEY='<your-key>'

3. Ejecutar servidor:

$env:WEBSOCKET_PORT='8002'; & .\.venv\Scripts\python.exe .\app.py

4. Cliente receptor (listener):

& .\.venv\Scripts\python.exe .\ws_listener.py

5. Scripts de prueba (en la carpeta scripts/):

& .\.venv\Scripts\python.exe .\scripts\add_via_ws_simple.py
& .\.venv\Scripts\python.exe .\create_emprendedor_demo.py

6. Notas:
- Usa los nombres de columnas exactos en los payloads: idproducto, idvendedor, nombreproducto, descripcion, precio, stock, categoria, imagenurl
- Para producción activa WSS/TLS y validación JWT.
