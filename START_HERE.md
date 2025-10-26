# 🚀 START HERE — PROYECTO-AUTONOMO

**¡Bienvenido!** Este archivo te guía en 5 minutos.

## ¿Qué es PROYECTO-AUTONOMO?

Un **marketplace realtime** con:
- ✅ **Servidor WebSocket** (Python): notificaciones en tiempo real, gestión de conexiones, heartbeat.
- ✅ **Frontend** (TypeScript/Node.js): interfaz del usuario.
- ✅ **Base de Datos** (Supabase): backend persistente.

**Arquitectura**: Monorepo con dos servicios independientes.

## 5 Minutos para Empezar

### Paso 1: Clona el repo

```bash
git clone <tu-repo-url>
cd PROYECTO-AUTONOMO
```

### Paso 2: Copia variables de entorno

```powershell
# En websoker/
Copy-Item websoker\.env.example websoker\.env
# Edita websoker\.env con tus credenciales Supabase
```

### Paso 3: Arranque rápido (2 terminales)

**Terminal 1: Python WebSocket**

```powershell
cd websoker
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Verás:
```
✅ Servidor WebSocket corriendo en ws://localhost:8000
Iniciando poller realtime (interval=5s)...
Iniciando heartbeat: interval=10s timeout=5s
```

**Terminal 2: Node.js Frontend**

```powershell
cd Markplace
npm install
npm start
```

Verás:
```
listening on port 3000
```

### Paso 4: Verificar en el navegador

Abre: `http://localhost:3000`

¡Listo! Ambos servicios están corriendo.

## ¿Qué Sigue?

### Para Exploradores

1. Lee **[INTEGRATION.md](./INTEGRATION.md)** — guía completa de arquitectura.
2. Lee **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** — comandos útiles.
3. Abre `websoker/app.py` — ve el servidor WebSocket en acción.

### Para Desarrolladores

1. Lee **[CONTRIBUTING.md](./CONTRIBUTING.md)** — guía de desarrollo.
2. Crea una rama: `git checkout -b feature/tu-idea`
3. Implementa tu cambio, testea, y abre un PR.

### Para DevOps / Ops

1. Lee **[docker-compose.yml](./docker-compose.yml)** — orquestación containerizada (opcional).
2. Lee **[CHANGELOG.md](./CHANGELOG.md)** — historial de cambios.

## Estructura del Proyecto

```
PROYECTO-AUTONOMO/
├── websoker/                   # Python WebSocket Server
│   ├── app.py                  # ⭐ Servidor principal
│   ├── config.py               # Config + Supabase
│   ├── requirements.txt         # Dependencias
│   ├── .venv/                  # Virtual env (creado en setup)
│   ├── .env.example            # Template env vars
│   ├── db/                     # DB utilities
│   ├── scripts/                # Test scripts
│   ├── Dockerfile              # Para Docker
│   └── README.md               # Detalles WebSocket
│
├── Markplace/                  # Node.js Frontend
│   ├── src/                    # Código fuente
│   ├── package.json            # Dependencias
│   ├── Dockerfile              # Para Docker
│   └── README.md               # Detalles Frontend
│
├── docker-compose.yml          # 🐳 Orquestación (opcional)
├── .gitignore                  # Git excludes
├── README.md                   # Inicio rápido
├── INTEGRATION.md              # 📖 Guía arquitectura
├── CONTRIBUTING.md             # 🤝 Guía de desarrollo
├── CHANGELOG.md                # 📜 Historial
├── QUICK_REFERENCE.md          # ⚡ Comandos rápidos
└── START_HERE.md              # Este archivo 👈
```

## Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "Module not found" (Python) | Verifica `.venv\Scripts\Activate.ps1` y `pip install -r requirements.txt` |
| "npm: command not found" | Instala Node.js desde nodejs.org |
| Port 8000 en uso | `$env:WEBSOCKET_PORT=8001; python app.py` |
| Conexión Supabase fallida | Verifica `.env`: SUPABASE_URL y SUPABASE_KEY correctos |
| Frontend no carga | Verifica `http://localhost:3000` y mira console del navegador |

## Documentación Completa

| Archivo | Para Qué |
|---------|----------|
| [README.md](./README.md) | Inicio rápido |
| **[INTEGRATION.md](./INTEGRATION.md)** | ⭐ Guía de arquitectura y startup detallado |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Estándares de desarrollo |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Comandos útiles (cheat sheet) |
| [CHANGELOG.md](./CHANGELOG.md) | Historial de cambios |
| [websoker/README.md](./websoker/README.md) | Detalles del servidor WebSocket |
| [Markplace/README.md](./Markplace/README.md) | Detalles del frontend |

## ¿Tienes Preguntas?

1. **Consulta la docs**: todos tus archivos `.md` están en la raíz y carpetas.
2. **Abre una Issue**: describe el problema.
3. **Contacta al equipo técnico**: para preguntas complejas.

## Características Implementadas ✅

- ✅ Notificaciones en tiempo real (WebSocket)
- ✅ Gestión de conexiones con heartbeat automático
- ✅ Subscripción a canales de eventos
- ✅ Broadcast de mensajes
- ✅ Poller realtime para cambios en BD
- ✅ Limpieza automática de conexiones muertas
- ✅ Reparación heurística de JSON malformado
- ✅ Monorepo limpio y escalable

## Próximas Mejoras 🔮

- 🔜 JWT authentication
- 🔜 Rate limiting
- 🔜 Redis Pub/Sub (para múltiples instancias)
- 🔜 Logs estructurados (ELK stack)
- 🔜 Unit tests (pytest + Jest)
- 🔜 CI/CD pipeline (GitHub Actions)

---

**¿Listo para empezar?** → Vuelve al Paso 2 arriba, o abre **[INTEGRATION.md](./INTEGRATION.md)** para más detalles.

**Última actualización**: 26 de octubre de 2025
