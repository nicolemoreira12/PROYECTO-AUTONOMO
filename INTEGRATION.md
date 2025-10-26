# PROYECTO-AUTONOMO — Integración de Servicios (Monorepo)

Este es un **monorepo** que integra dos servicios independientes:

1. **websoker** (Python): Servidor WebSocket con notificaciones en tiempo real, gestión de conexiones y heartbeat.
2. **Markplace** (TypeScript/Node.js): Frontend/API del marketplace.

## Estructura

```
PROYECTO-AUTONOMO/
├── websoker/                    # Python WebSocket Server
│   ├── app.py                   # Servidor principal
│   ├── config.py                # Config + Supabase client
│   ├── requirements.txt
│   ├── .venv/                   # Virtual environment
│   ├── db/                       # DB utilities
│   ├── scripts/                  # Test scripts
│   └── README.md
│
├── Markplace/                   # TypeScript/Node.js Frontend/API
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── docker-compose.yml            # (Optional) Orquestar ambos
└── INTEGRATION.md                # Este archivo
```

## Por qué Monorepo (Opción A)

- **Simplicidad**: cada servicio es independiente.
- **Flexibilidad**: puedes desarrollar y deployar cada uno por separado.
- **Escalabilidad**: fácil de crecer: añadir más servicios Python o Node.js sin conflictos.
- **Claridad**: no hay mezcla de lenguajes en un archivo; cada carpeta es su propio proyecto.

## Cómo Arrancar Localmente

### Paso 1: Terminal 1 — Servidor WebSocket (Python)

```powershell
cd websoker

# Crear venv si no existe
python -m venv .venv

# Activar venv
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (opcional)
$env:WEBSOCKET_PORT = '8000'
$env:SUPABASE_URL = 'tu_supabase_url'
$env:SUPABASE_KEY = 'tu_supabase_key'

# Arrancar servidor
python .\app.py
```

Esperarás ver:
```
✅ Servidor WebSocket corriendo en ws://localhost:8000
Iniciando poller realtime (interval=5s). last_seen_id inicial=...
Iniciando heartbeat: interval=10s timeout=5s
```

### Paso 2: Terminal 2 — Frontend/API (Node.js)

```powershell
cd Markplace

# Instalar dependencias
npm install

# Configurar variables de entorno (si procede)
# (edita .env o .env.local según tu setup)

# Arrancar servidor (según script en package.json)
npm start
# o
npm run dev
```

Esperarás ver algo como:
```
> Markplace@1.0.0 start
> listening on port 3000
```

### Paso 3: Pruebas

#### Test 1: Conectar un listener WS (Terminal 3)

```powershell
cd websoker
python .\ws_listener.py
```

Debería mostrar:
```
Conectado al servidor WS, esperando mensajes...
```

#### Test 2: Enviar una notificación desde cliente (Terminal 4, o script Python)

```python
import asyncio, websockets, json

async def test():
    uri = "ws://localhost:8000"
    async with websockets.connect(uri) as ws:
        # Subscribe a canal
        await ws.send(json.dumps({"action":"subscribe","channel":"productos"}))
        print("Sent subscribe")
        
        # Notify a suscriptores
        await ws.send(json.dumps({"action":"notify","channel":"productos","payload":{"id":123,"msg":"hola"}}))
        print("Sent notify")
        
        # Recibir respuesta
        for _ in range(3):
            msg = await ws.recv()
            print("Received:", msg)

asyncio.run(test())
```

Verás mensajes como:
```
{"type":"subscribed","channel":"productos"}
{"type":"notify_ack","channel":"productos"}
RECIBIDO: {"type":"notification","channel":"productos","data":{"id":123,"msg":"hola"}}
```

## Variables de Entorno

### websoker

- `WEBSOCKET_PORT`: puerto (default 8000)
- `WEBSOCKET_HOST`: host (default localhost)
- `PING_INTERVAL`: segundos entre pings (default 10)
- `PING_TIMEOUT`: timeout pong (default 5)
- `POLL_INTERVAL`: segundos entre polls BD (default 5)
- `SUPABASE_URL`: URL de Supabase
- `SUPABASE_KEY`: API key de Supabase

Crea un `.env` en `websoker/` o copia `.env.example` y edita.

### Markplace

Consulta `Markplace/README.md` para variables de Node.js.

## Docker Compose (Opcional)

Si tienes Docker instalado, puedes orquestar ambos servicios:

```bash
docker-compose up
```

Esto levanta:
- `websoker` en `ws://localhost:8000`
- `Markplace` (API) en `http://localhost:3000`

(Requiere Dockerfile en cada carpeta — no incluido aún, pero puede añadirse si lo necesitas.)

## Desarrollo

### Branching

- Crea branches descriptivas: `feature/nombre`, `fix/descripción`, `docs/xxx`.
- Desarrolla en tu rama, prueba localmente, y luego haz PR a `main`.

### Estructura de cambios

- Si cambias `websoker/`: ejecuta `python -m py_compile websoker/**/*.py` para verificar sintaxis.
- Si cambias `Markplace/`: ejecuta `npm run lint` y `npm test` (si están configurados).

### Pruebas

- `websoker`: tests en `websoker/tests/` (si los añades). Ejecuta con `pytest`.
- `Markplace`: tests en `Markplace/__tests__/` (si los añades). Ejecuta con `npm test`.

## Comunicación entre Servicios

Actualmente:
- **Frontend (Markplace)** → **WebSocket (websoker)**: cliente WS se conecta a `ws://localhost:8000` o URL desplegada.
- **Markplace** NO hace llamadas REST directo a `websoker` (son servicios desacoplados).

Si necesitas que **Markplace** (Node.js) exponga un endpoint REST que haga proxy a WS:
- Puedes crear un endpoint en Markplace que actúe de proxy/gateway.
- O usar un cliente WS dentro de Markplace para conectarse a `websoker` y relayar eventos a clientes web.

(Consulta con el equipo si necesitas implementar eso.)

## Limitaciones y Mejoras

- **Escalabilidad**: WS es single-instance. Para múltiples instancias, integra Redis Pub/Sub.
- **Seguridad**: sin autenticación/autorización. Recomendación: JWT tokens en headers WS.
- **Rate Limiting**: sin protección contra abuso. Recomendación: límites por IP/socket.
- **Observabilidad**: sin logs estructurados ni métricas. Recomendación: Prometheus + ELK.

## Contacto / Preguntas

- Revisa README.md en cada carpeta (`websoker/README.md`, `Markplace/README.md`).
- Consulta al equipo si necesitas aclaraciones.

---

**Última actualización**: 26 de octubre de 2025
