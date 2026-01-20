# 🚀 Guía de Inicio - Marketplace con Backend Real

## ✅ Tu Frontend Ya Está Conectado al Backend

El frontend ya está configurado para obtener los productos reales de tu base de datos en **Markplace**.

## 📋 Pasos para Iniciar Todo

### Terminal 1: Iniciar Backend (Markplace)

```powershell
cd Markplace
npm run dev
```

Deberías ver:
```
✅ Servidor funcionando en puerto 3000
✅ Base de datos conectada
```

### Terminal 2: Iniciar Frontend

```powershell
cd marketplace-frontend
npm run dev
```

Deberías ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## 🔍 Verificar Conexión

Ejecuta el script de prueba:

```powershell
.\TEST-CONNECTION.ps1
```

Este script verificará que el backend responda y mostrará los productos disponibles.

## 🎯 Configuración Actual

### Backend (Markplace)
- **URL:** `http://localhost:3000`
- **API:** `http://localhost:3000/api`
- **Endpoints:**
  - `GET /api/productos` - Obtener todos los productos
  - `GET /api/productos/:id` - Obtener producto por ID
  - `GET /api/productos/search?q=...` - Buscar productos
  - `GET /api/categorias` - Obtener categorías
  - Y más...

### Frontend
- **URL:** `http://localhost:5173`
- **Configuración:** Archivo `.env` en `marketplace-frontend/`

```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH_URL=http://localhost:4000
VITE_PAYMENT_URL=http://localhost:5000
VITE_WEBSOCKET_URL=ws://127.0.0.1:8000
```

## 📦 Cómo Funciona la Conexión

### 1. HomePage carga productos reales

```typescript
// marketplace-frontend/src/presentation/hooks/useProductos.ts
const productoRepository = new ProductoRepositoryImpl();
// ↓ Llama a tu API
const productos = await productoRepository.getAll();
// GET http://localhost:3000/api/productos
```

### 2. ProductoDetallePage muestra detalles reales

```typescript
// marketplace-frontend/src/presentation/pages/ProductoDetallePage.tsx
const producto = await productoRepository.getById(id);
// GET http://localhost:3000/api/productos/:id
```

### 3. Búsqueda usa tu backend

```typescript
// Cuando buscas productos
const resultados = await searchProductosUseCase.execute(query);
// GET http://localhost:3000/api/productos/search?q=query
```

## 🗄️ Base de Datos

Asegúrate de tener productos en tu base de datos. Si no tienes productos:

1. Ve a la ruta de emprendedor: `http://localhost:5173/emprendedor`
2. Inicia sesión como emprendedor
3. Agrega productos desde la interfaz

O usando el backend directamente:

```powershell
cd Markplace
npm run seed  # Si tienes un script de seed
```

## ⚠️ Solución de Problemas

### Error: "No se pudieron cargar los productos"

**Causa:** El backend no está corriendo o hay un error de conexión.

**Solución:**
1. Verifica que el backend esté corriendo: `http://localhost:3000`
2. Abre la consola del navegador (F12) y revisa errores
3. Verifica que la URL en `.env` sea correcta

### Error: "Network Error" o "CORS"

**Causa:** El backend no permite solicitudes del frontend.

**Solución:**
El backend ya tiene CORS configurado en `Markplace/src/index.ts`:
```typescript
res.header("Access-Control-Allow-Origin", "*");
```

Si sigue el error, reinicia el backend.

### Los productos no aparecen pero no hay error

**Causa:** No hay productos en la base de datos.

**Solución:**
1. Verifica la base de datos
2. Agrega productos desde la interfaz de emprendedor
3. O ejecuta: `.\TEST-CONNECTION.ps1` para ver si el backend responde

## 🔧 Estructura de Archivos Clave

```
PROYECTO-AUTONOMO/
├── Markplace/                    # Backend (Puerto 3000)
│   ├── src/
│   │   ├── index.ts             # Servidor principal
│   │   ├── routes/              # Rutas de API
│   │   │   ├── Producto.routes.ts
│   │   │   └── ...
│   │   └── controllers/         # Lógica de negocio
│   └── package.json
│
├── marketplace-frontend/         # Frontend (Puerto 5173)
│   ├── .env                     # Configuración de URLs
│   ├── src/
│   │   ├── infrastructure/
│   │   │   ├── api/
│   │   │   │   ├── http-client.ts     # Cliente HTTP
│   │   │   │   ├── endpoints.ts       # URLs de API
│   │   │   │   └── microservices.config.ts
│   │   │   └── repositories/
│   │   │       └── ProductoRepositoryImpl.ts  # Conecta con API
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       └── producto.use-cases.ts      # Lógica de negocio
│   │   └── presentation/
│   │       ├── hooks/
│   │       │   └── useProductos.ts    # Hook que usa el repositorio
│   │       └── pages/
│   │           ├── HomePage.tsx       # Muestra productos
│   │           └── ProductoDetallePage.tsx
│   └── package.json
│
├── START-MARKETPLACE.ps1         # Inicia todo automáticamente
└── TEST-CONNECTION.ps1           # Prueba la conexión
```

## 🎨 Flujo de Datos

```
Usuario visita HomePage
    ↓
HomePage usa useProductos hook
    ↓
useProductos llama a GetProductosUseCase
    ↓
GetProductosUseCase usa ProductoRepositoryImpl
    ↓
ProductoRepositoryImpl hace HTTP GET
    ↓
http://localhost:3000/api/productos
    ↓
Backend Markplace procesa la solicitud
    ↓
Base de datos retorna productos
    ↓
Productos se muestran en la interfaz
```

## 📝 Cambios Realizados

### ✅ ProductoDetallePage.tsx
- ❌ Antes: Usaba función simulada que retornaba `null`
- ✅ Ahora: Usa `ProductoRepositoryImpl` que se conecta al backend real

```typescript
// ANTES (simulado)
const getProductoById = async (id: number) => {
    return null;  // No hacía nada
};

// AHORA (real)
const productoRepository = new ProductoRepositoryImpl();
const producto = await productoRepository.getById(id);
// Obtiene el producto real de tu base de datos
```

### ✅ HomePage.tsx
- Ya estaba conectado correctamente
- Usa `useProductos` hook que se conecta al backend

### ✅ Configuración
- `.env` apunta a `http://localhost:3000/api`
- `http-client.ts` maneja autenticación y errores
- `endpoints.ts` define todas las rutas de la API

## 🚀 ¡Listo para Usar!

1. **Ejecuta:** `.\START-MARKETPLACE.ps1`
2. **Abre:** `http://localhost:5173`
3. **Verifica:** Los productos de tu base de datos se mostrarán automáticamente

## 📞 Soporte

Si tienes problemas:
1. Verifica que ambos servidores estén corriendo
2. Ejecuta `.\TEST-CONNECTION.ps1` para diagnosticar
3. Revisa la consola del navegador (F12)
4. Revisa los logs del backend en su terminal

---

**¡Tu frontend ahora obtiene los productos reales de la base de datos de Markplace!** 🎉
