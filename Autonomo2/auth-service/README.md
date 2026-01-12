# 🔐 Auth Service - Microservicio de Autenticación

Microservicio independiente de autenticación con JWT (access + refresh tokens), diseñado para validación local sin necesidad de consultar al Auth Service en cada petición.

## 📋 Características

- ✅ **JWT con Access y Refresh Tokens**: Tokens de acceso de corta duración (15min) y tokens de renovación (7 días)
- ✅ **Validación Local**: Otros servicios validan tokens localmente verificando firma y expiración
- ✅ **Base de Datos Propia**: PostgreSQL con tablas para usuarios, refresh tokens y tokens revocados
- ✅ **Rate Limiting**: Protección contra ataques de fuerza bruta en login (5 intentos/15 min)
- ✅ **Blacklist de Tokens**: Redis (opcional) + PostgreSQL para tokens revocados
- ✅ **Bloqueo de Cuenta**: Después de 5 intentos fallidos, la cuenta se bloquea por 15 minutos
- ✅ **Rotación de Tokens**: Al renovar, se revoca el refresh token anterior

## 🏗️ Arquitectura

```
auth-service/
├── src/
│   ├── config/           # Configuración (DB, JWT, Redis)
│   ├── controllers/      # Controladores HTTP
│   ├── entities/         # Entidades TypeORM
│   ├── middlewares/      # Rate limiting, Auth
│   ├── routes/           # Definición de rutas
│   ├── services/         # Lógica de negocio
│   ├── shared/           # Módulo compartido para otros servicios
│   ├── utils/            # Utilidades (JWT, password)
│   └── index.ts          # Punto de entrada
├── .env                  # Variables de entorno
├── package.json
└── tsconfig.json
```

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd Autonomo2/auth-service
npm install
```

### 2. Configurar Base de Datos

Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE auth_service_db;
```

### 3. Configurar variables de entorno

Editar el archivo `.env`:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=auth_service_db
JWT_ACCESS_SECRET=tu-clave-secreta-segura
JWT_REFRESH_SECRET=otra-clave-secreta-segura
```

### 4. Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📡 Endpoints

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Registrar usuario | Público |
| POST | `/auth/login` | Iniciar sesión | Público |
| POST | `/auth/logout` | Cerrar sesión | Con token |
| POST | `/auth/refresh` | Renovar tokens | Público |
| GET | `/auth/me` | Obtener usuario actual | Privado |
| GET | `/auth/validate` | Validar token (interno) | Interno |
| POST | `/auth/revoke-all` | Revocar todas las sesiones | Privado |
| GET | `/health` | Estado del servicio | Público |

## 📝 Ejemplos de Uso

### Registro

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "password": "Password123!",
    "phone": "+593999999999"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "uuid-del-usuario",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@email.com",
      "role": "user",
      "status": "active"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessExpiresAt": "2024-01-15T10:30:00.000Z",
      "refreshExpiresAt": "2024-01-22T10:15:00.000Z"
    }
  }
}
```

### Login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@email.com",
    "password": "Password123!"
  }'
```

### Refresh Token

```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Obtener Usuario Actual

```bash
curl -X GET http://localhost:4000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Logout

```bash
curl -X POST http://localhost:4000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## 🔗 Integración con Otros Servicios

### Validación Local (Recomendado)

Copiar el archivo `src/shared/jwt-validator.ts` a otros microservicios y configurar la misma `JWT_ACCESS_SECRET`:

```typescript
import { authMiddlewareLocal } from './shared/jwt-validator';

// Proteger rutas
app.get('/api/productos', authMiddlewareLocal, (req, res) => {
  // req.user contiene: { userId, email, role, jti, type }
  res.json({ productos: [...] });
});
```

### Validación Remota (Solo cuando sea necesario)

Usar cuando se necesite verificar si un token está en la blacklist:

```typescript
import { validateTokenRemote } from './shared/jwt-validator';

const result = await validateTokenRemote(token, 'http://localhost:4000');
if (result.valid) {
  // Token válido
}
```

## 📊 Base de Datos

### Tablas

1. **users**: Información de usuarios
2. **refresh_tokens**: Tokens de renovación activos
3. **revoked_tokens**: Blacklist de tokens revocados

### Diagrama ER

```
┌─────────────┐       ┌─────────────────┐
│   users     │       │ refresh_tokens  │
├─────────────┤       ├─────────────────┤
│ id (PK)     │──────<│ userId (FK)     │
│ firstName   │       │ token           │
│ lastName    │       │ expiresAt       │
│ email       │       │ isRevoked       │
│ password    │       │ ipAddress       │
│ role        │       │ userAgent       │
│ status      │       └─────────────────┘
│ lastLoginAt │
└─────────────┘       ┌─────────────────┐
                      │ revoked_tokens  │
                      ├─────────────────┤
                      │ jti             │
                      │ tokenType       │
                      │ userId          │
                      │ expiresAt       │
                      └─────────────────┘
```

## 🔒 Seguridad

- **Contraseñas**: Hasheadas con bcrypt (12 rounds)
- **Rate Limiting**: 
  - Login: 5 intentos / 15 minutos
  - Registro: 10 / hora
  - API general: 100 / minuto
- **Bloqueo de cuenta**: 15 minutos después de 5 intentos fallidos
- **Tokens JWT**: Firmados con HS256, con issuer y audience

## 📚 Referencias

- [JSON Web Tokens](https://jwt.io/)
- [OAuth 2.0 Best Practices](https://oauth.net/2/)
- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
