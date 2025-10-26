# Quick Reference — PROYECTO-AUTONOMO

**Comandos rápidos para desarrollo local.**

## Arranque Rápido

### Python WebSocket

```powershell
cd websoker
.\.venv\Scripts\Activate.ps1  # O: .venv\Scripts\Activate.ps1
python app.py
# Esperado: ✅ Servidor WebSocket corriendo en ws://localhost:8000
```

### Node.js Frontend

```powershell
cd Markplace
npm start
# Esperado: listening on port 3000
```

### Test Client (nuevo Terminal)

```powershell
cd websoker
python ws_listener.py
# Verá mensajes entrantes del servidor
```

## Variables de Entorno

### websoker/.env

```env
WEBSOCKET_PORT=8000
WEBSOCKET_HOST=localhost
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-api-key
PING_INTERVAL=10
PING_TIMEOUT=5
POLL_INTERVAL=5
```

Copia desde `websoker/.env.example`.

## Git Workflow

```bash
# Crear rama
git checkout -b feature/tu-feature

# Editar + commit
git commit -m "feat(websoker): add new feature"

# Push
git push origin feature/tu-feature

# PR en GitHub/GitLab
# Merge a main después de aprobación
```

## Testing

### Sintaxis Python

```powershell
cd websoker
python -m py_compile app.py config.py db/client.py
# Si no hay output, está bien (no hay errores)
```

### Test WebSocket Manual

```python
# En cualquier terminal (reqs: websockets)
python -c "
import asyncio, websockets, json

async def test():
    async with websockets.connect('ws://localhost:8000') as ws:
        await ws.send(json.dumps({'action':'ping'}))
        print(await ws.recv())

asyncio.run(test())
"
```

## Dockerfile Build (opcional)

```bash
# Websoker
docker build -t proyecto-autonomo-websoker ./websoker

# Markplace
docker build -t proyecto-autonomo-markplace ./Markplace
```

## Docker Compose (opcional)

```bash
# Arrancar ambos servicios
docker-compose up

# Ver logs
docker-compose logs -f websoker

# Parar
docker-compose down
```

## Troubleshooting

| Problema | Síntoma | Solución |
|----------|---------|----------|
| Puerto 8000 en uso | `OSError: [Errno 10048]` | `$env:WEBSOCKET_PORT=8001; python app.py` |
| Listener no conecta | `connection refused` | Verifica que servidor esté corriendo (`python app.py`) |
| .venv no activa | `python: command not found` | Ejecuta: `.\.venv\Scripts\Activate.ps1` en PowerShell |
| Supabase error | `404` o `401` | Verifica `.env`: SUPABASE_URL y SUPABASE_KEY correctos |
| JSON parsing error | `JSONDecodeError` | Mensaje probablemente tiene prefijo; `sanear_mensaje()` lo maneja |

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `websoker/app.py` | Servidor WebSocket principal |
| `websoker/config.py` | Config + Supabase init |
| `websoker/.env.example` | Template de env vars |
| `Markplace/src/index.ts` | Punto de entrada frontend |
| `docker-compose.yml` | Orquestación (opcional) |
| `INTEGRATION.md` | Guía completa de startup |
| `CONTRIBUTING.md` | Estándares de desarrollo |

## Logs Esperados

### Inicio de servidor

```
pk_column detectada: idproducto, last_seen_id inicializado a X
✅ Servidor WebSocket corriendo en ws://localhost:8000
Iniciando poller realtime (interval=5s). last_seen_id inicial=X
Iniciando heartbeat: interval=10s timeout=5s
```

### Cliente conectado

```
Cliente conectado: IPv6Address('::1')
RECIBIDO: {"action":"ping"}
→ pong
```

## URLs

- **WebSocket**: `ws://localhost:8000` (local dev) → `wss://tu-dominio.com:8000` (prod)
- **Frontend**: `http://localhost:3000`
- **Supabase**: configurado en `.env`

## Recursos

- 📖 [INTEGRATION.md](./INTEGRATION.md) — guía completa
- 🔧 [CONTRIBUTING.md](./CONTRIBUTING.md) — estándares de desarrollo
- 📝 [CHANGELOG.md](./CHANGELOG.md) — historial de cambios
- 📜 [websoker/README.md](./websoker/README.md) — detalles WS

---

**Última actualización**: 26 de octubre de 2025
