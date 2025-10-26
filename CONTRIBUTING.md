# Guía de Contribuciones — PROYECTO-AUTONOMO

Bienvenido al proyecto. Esta guía te ayudará a contribuir de manera efectiva.

## Setup Local

### Requisitos Previos

- Python 3.10+ (para websoker)
- Node.js 18+ (para Markplace)
- Git
- Docker (opcional, para desarrollo containerizado)

### Setup de websoker (Python)

```powershell
cd websoker

# Crear virtual environment
python -m venv .venv

# Activar
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Variables de entorno (copiar template)
Copy-Item .env.example .env
# Editar .env con tus valores
```

### Setup de Markplace (Node.js)

```powershell
cd Markplace

# Instalar dependencias
npm install

# Variables de entorno (si procede)
# Copy-Item .env.example .env
```

## Branching Workflow

1. **Crea una rama descriptiva** desde `main`:

```bash
git checkout -b feature/nombre-corto
# o
git checkout -b fix/descripcion
# o
git checkout -b docs/actualizacion
```

2. **Desarrolla y testea localmente** (ver sección Testing).

3. **Commit regularmente** con mensajes claros:

```bash
git commit -m "Add real-time notifications to channel XYZ"
git commit -m "Fix port mismatch in ws_listener.py"
git commit -m "Update INTEGRATION.md with startup guide"
```

4. **Push a tu rama**:

```bash
git push origin feature/nombre-corto
```

5. **Abre un Pull Request** (PR) en GitHub/GitLab describiendo:
   - Qué cambios haces
   - Por qué los haces
   - Cómo testeaste
   - Algún ticket/issue relacionado

6. **Code review**: un compañero revisa, sugiere cambios, aprueba.

7. **Merge** a `main` después de aprobación y tests pasen.

## Testing

### Python (websoker)

#### Verificar sintaxis

```powershell
cd websoker
python -m py_compile app.py
python -m py_compile config.py
# etc
```

#### Ejecutar pruebas unitarias (si existen)

```powershell
pytest tests/ -v
# o (sin pytest)
python -m unittest discover tests
```

#### Test manual del servidor

```powershell
# Terminal 1: Arrancar servidor
python .\app.py

# Terminal 2: Ejecutar listener
python .\ws_listener.py

# Terminal 3: Enviar datos (según el test)
python .\scripts\add_via_ws_simple.py
# o
python .\create_emprendedor_demo.py
```

### Node.js (Markplace)

#### Verificar sintaxis

```powershell
cd Markplace
npm run lint
# (si está configurado en package.json)
```

#### Tests

```powershell
npm test
# (si está configurado)
```

#### Test manual

```powershell
npm start
# Luego navega a http://localhost:3000
```

## Estándares de Código

### Python (websoker)

- **PEP 8**: sigue convenciones de estilo Python.
- **Imports**: agrupa en orden: built-ins, third-party, local.
- **Type hints**: opcional pero recomendado para funciones públicas.
- **Docstrings**: usa formato Google o Numpy.

Ejemplo:

```python
def subscribe_channel(ws: WebSocketServerProtocol, canal: str) -> bool:
    """
    Suscribe un cliente WS a un canal específico.
    
    Args:
        ws: objeto WebSocket.
        canal: nombre del canal.
    
    Returns:
        True si se suscribió exitosamente, False si error.
    """
    # tu código
```

### TypeScript/Node.js (Markplace)

- **ESLint**: sigue configuración del proyecto.
- **Prettier**: formatea código (si está configurado).
- **Type safety**: usa `strict: true` en `tsconfig.json`.
- **Componentes**: PascalCase; funciones: camelCase.

## Lint & Format

### Python

```powershell
cd websoker

# Lint con flake8 (si está instalado)
flake8 . --max-line-length=120

# Format con black (si está instalado)
black .
```

### Node.js

```powershell
cd Markplace

# Lint
npm run lint

# Format
npm run format
# (si está configurado)
```

## Commit Messages

Sigue este formato:

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **scope**: área afectada (ej: `websoker`, `markplace`, `config`)
- **subject**: frase corta (imperative, lowercase, sin punto final)
- **body**: explicación detallada (opcional)
- **footer**: ticket/issue relacionados (ej: `Closes #123`)

Ejemplos:

```
feat(websoker): add Redis Pub/Sub for multi-instance support

fix(ws_listener): correct port from 8002 to 8000

docs(INTEGRATION): update startup instructions
```

## Release & Deployment

(A definir según tu proceso. Ejemplo genérico:)

1. Actualiza versión en `package.json` (Node) y `setup.py` (Python).
2. Crea tag en Git: `git tag v1.2.3`
3. Push tag: `git push origin v1.2.3`
4. CI/CD (GitHub Actions, etc) automáticamente deploya.

## Preguntas / Soporte

- Abre una **Issue** en el repo para reportar bugs o solicitar features.
- Usa **Discussions** para preguntas generales.
- Contacta al equipo técnico si tienes dudas sobre arquitectura.

---

**Gracias por contribuir! 🚀**
