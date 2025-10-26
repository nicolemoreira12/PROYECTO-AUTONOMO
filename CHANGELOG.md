# CHANGELOG — PROYECTO-AUTONOMO

Todos los cambios notables en este proyecto están documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Docker support: `docker-compose.yml` y Dockerfiles para websoker y Markplace.
- Monorepo documentation: `INTEGRATION.md` con guía completa de startup.
- Contributing guide: `CONTRIBUTING.md` con estándares de desarrollo.
- Enhanced `.gitignore` con patrones para Python, Node, Docker, IDEs.

### Fixed
- `ws_listener.py`: puerto corregido de 8002 a 8000 para coincidir con servidor.
- `README.md`: actualizado con estructura monorepo y instrucciones simplificadas.

### Changed
- Restructuración conceptual: websoker y Markplace ahora como servicios independientes en monorepo.
- README: más conciso, con referencia a `INTEGRATION.md` para detalles.

## [1.0.0] — 2025-10-26

### Added
- Core WebSocket server (`websoker/app.py`):
  - Message sanitization (`sanear_mensaje`).
  - JSON repair heuristics (`intentar_reparar_json`).
  - Key normalization (`normalize_product_keys`).
  - Safe broadcast (`envio_seguro`, `difundir`).
  - Channel subscriptions (`subscribe_channel`, `unsubscribe_channel`, `notify_channel`).
  - Heartbeat mechanism (`heartbeat_loop`) with automatic dead-client cleanup.
  - Realtime poller (`poller_realtime`) for database change detection.
  - WebSocket actions: `subscribe`, `unsubscribe`, `notify`, `ping`, `get_products`, `add_product`.
  
- Demo scripts:
  - `create_emprendedor_demo.py`: inserta demo emprendedor para resolver FK constraints.
  - `ws_listener.py`: test client para verificar broadcasts.
  - `scripts/add_via_ws_simple.py`: envía `add_product` via WS.

- Configuration & environment:
  - `config.py`: Supabase client initialization.
  - `.env.example`: template de variables de entorno.
  - `db/client.py`: wrapper para DB access.

- Documentation:
  - `websoker/README.md`: guía específica del servidor WebSocket.

- Project structure:
  - `.gitignore` inicial.
  - `requirements.txt` con dependencias Python.

### Fixed
- JSON parsing errors: POST requests con prefixes ("(Text):", BOMs) ahora se limpian.
- Foreign key constraint errors: demo script para crear datos base.
- Column name mismatches: `normalize_product_keys()` standardiza a lowercase.
- Dead client connections: heartbeat + cleanup elimina sockets inactivos.
- Connection rejection on Windows: diagnosticada y documentada solución para port binding.

### Known Issues
- Single-instance WS: no escalable a múltiples servidores. Solución futura: Redis Pub/Sub.
- No authentication: canales públicos sin JWT. Recomendación: auth layer antes de producción.
- No rate limiting: vulnerable a spam. Recomendación: implement rate limiter.

---

## Historia Anterior

### Archivos históricos removidos/consolidados
- Anteriormente: múltiples ramas experimentales (`cleanup/websoker-structure`, etc.) fueron consolidadas en `main`.
- Antiguo setup: scripts y docs esparcidos; ahora centralizados.

---

**Última actualización**: 26 de octubre de 2025
