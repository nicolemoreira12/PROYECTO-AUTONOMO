# PROYECTO-AUTONOMO — Marketplace Realtime

**Monorepo** con WebSocket realtime + Frontend integrados.

## 📁 Estructura

- **websoker/** (Python): Servidor WebSocket con notificaciones en tiempo real, gestión de conexiones, heartbeat.
- **Markplace/** (TypeScript/Node.js): Frontend/API del marketplace.
- **INTEGRATION.md**: Guía completa de integración y startup.

## 🚀 Arranque Rápido

### Terminal 1 — Servidor WebSocket

```powershell
cd websoker
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python .\app.py
```

Verás: `✅ Servidor WebSocket corriendo en ws://localhost:8000`

### Terminal 2 — Frontend

```powershell
cd Markplace
npm install
npm start
```

Verás: `listening on port 3000` (o similar)

### Terminal 3 — Test (opcional)

```powershell
cd websoker
python .\ws_listener.py
```

## 📚 Documentación Completa

- Startup detallado → **INTEGRATION.md**
- Servidor WebSocket → **websoker/README.md**
- Frontend → **Markplace/README.md**

## 🔧 Variables de Entorno

Edita o crea `.env` en `websoker/`:

```env
WEBSOCKET_PORT=8000
WEBSOCKET_HOST=localhost
SUPABASE_URL=tu_url
SUPABASE_KEY=tu_key
PING_INTERVAL=10
PING_TIMEOUT=5
POLL_INTERVAL=5
```

Copia desde `.env.example` si existe.

## ✅ Características

- ✅ Notificaciones en tiempo real (WebSocket)
- ✅ Gestión de conexiones con heartbeat
- ✅ Subscripción a canales
- ✅ Broadcast de eventos
- ✅ Poller realtime para cambios BD
- ✅ Estructura monorepo limpia

## 🛠️ Próximas Mejoras

- Docker Compose para orquestación
- JWT authentication
- Redis Pub/Sub para escalabilidad
- Rate limiting
- Logs estructurados

---

**Ver INTEGRATION.md para detalles completos.**

