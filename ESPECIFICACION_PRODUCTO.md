# 📋 ESPECIFICACIÓN DEL PRODUCTO - MARKETPLACE CON SISTEMA DE WALLET CRIPTO

## 🎯 INFORMACIÓN DEL PROYECTO

**Nombre del Proyecto:** Marketplace Mantense Ecuador  
**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Tipo de Plataforma:** E-commerce con Sistema de Billetera Cripto  
**Repositorio:** nicolemoreira12/PROYECTO-AUTONOMO  

---

## 📖 RESUMEN EJECUTIVO

**Marketplace Mantense Ecuador** es una plataforma de comercio electrónico diseñada para conectar **emprendedores ecuatorianos** con **compradores** interesados en productos artesanales y locales. La plataforma integra un **sistema de billetera virtual basado en criptomonedas** que permite transacciones seguras, rápidas y descentralizadas.

### Propósito Principal

Crear un ecosistema digital que:
1. Facilite la venta de productos artesanales ecuatorianos
2. Proporcione a los emprendedores herramientas para gestionar su negocio
3. Ofrezca a los compradores una experiencia de compra segura y moderna
4. Implemente un sistema de pagos con criptomonedas para mayor flexibilidad

### Usuarios Objetivo

- **Emprendedores:** Artesanos y pequeños negocios ecuatorianos
- **Compradores:** Consumidores interesados en productos locales y artesanales
- **Administradores:** Personal de gestión de la plataforma

---

## 🏗️ ARQUITECTURA DEL SISTEMA

El proyecto está construido con una arquitectura de **microservicios**, separando responsabilidades en tres servicios principales:

### 1. **Servicio REST API (TypeScript/Node.js)** 
**Ubicación:** `/Markplace`

**Responsabilidades:**
- API RESTful principal para operaciones CRUD
- Autenticación y autorización con JWT
- Gestión de productos, usuarios, órdenes y pagos
- Sistema de billetera virtual y transacciones

**Stack Tecnológico:**
- Node.js con Express
- TypeScript
- TypeORM como ORM
- PostgreSQL como base de datos
- JWT para autenticación
- Bcrypt para encriptación de contraseñas

**Puerto:** 3000

---

### 2. **Servicio GraphQL (Ruby)** 
**Ubicación:** `/graphql-ruby`

**Responsabilidades:**
- API GraphQL para consultas complejas
- Generación de reportes y estadísticas
- Análisis de datos del marketplace
- Dashboard analítico

**Stack Tecnológico:**
- Ruby
- Sinatra como framework web
- GraphQL-Ruby
- ActiveRecord como ORM
- PostgreSQL (compartida con REST API)

**Puerto:** 4000

---

### 3. **Servicio WebSocket (Python)** 
**Ubicación:** `/websoker`

**Responsabilidades:**
- Comunicación en tiempo real
- Notificaciones push
- Actualizaciones de dashboard en vivo
- Sistema de eventos y suscripciones

**Stack Tecnológico:**
- Python
- WebSocket
- Asyncio para operaciones asíncronas
- Integración con Supabase

**Puerto:** 8000

---

## 💼 CARACTERÍSTICAS PRINCIPALES

### 1. Sistema de Marketplace

#### Gestión de Productos
- Creación, edición y eliminación de productos
- Categorización de productos
- Control de inventario y stock
- Imágenes de productos
- Búsqueda y filtrado

#### Gestión de Emprendedores
- Registro de emprendedores
- Perfil de negocio
- Catálogo de productos por emprendedor
- Estadísticas de ventas

#### Gestión de Usuarios
- Registro y autenticación
- Perfiles de usuario
- Historial de compras
- Gestión de direcciones

#### Sistema de Carrito y Órdenes
- Carrito de compras persistente
- Proceso de checkout
- Gestión de órdenes
- Estados de orden (pendiente, procesada, enviada, entregada)
- Detalles de orden

---

### 2. Sistema de Billetera Virtual y Criptomonedas

#### Tarjetas Virtuales (Wallets)
**Entidad:** `TarjetaVirtual`

Cada usuario puede tener una o más tarjetas virtuales con las siguientes características:

**Atributos:**
- `idTarjeta`: Identificador único
- `idUsuario`: Relación con el usuario propietario
- `numeroTarjeta`: Número único de la tarjeta (20 caracteres)
- `saldoDisponible`: Balance actual en la wallet
- `fechaExpiracion`: Fecha de vencimiento
- `estado`: Estado de la tarjeta (activa, bloqueada, expirada)

**Funcionalidades:**
- Creación de wallets para usuarios
- Recarga de saldo
- Consulta de balance
- Bloqueo/desbloqueo de tarjetas
- Historial de transacciones

#### Sistema de Transacciones
**Entidad:** `Transaccion`

Registro completo de todas las operaciones financieras:

**Atributos:**
- `idTransaccion`: Identificador único
- `idTarjeta`: Tarjeta origen/destino
- `monto`: Cantidad de la transacción
- `tipo`: Tipo de operación (DEPÓSITO, COMPRA, RETIRO)
- `fecha`: Timestamp de la transacción

**Tipos de Transacciones:**
1. **DEPÓSITO:** Recarga de saldo a la wallet
2. **COMPRA:** Pago por productos del marketplace
3. **RETIRO:** Extracción de fondos (futura implementación)

**Flujo de Transacción:**
1. Usuario selecciona productos
2. Procede al checkout
3. Sistema valida saldo en wallet
4. Si hay saldo suficiente, se crea transacción de tipo COMPRA
5. Se descuenta del saldo de la tarjeta
6. Se registra la transacción
7. Se actualiza el estado de la orden

---

### 3. Sistema de Pagos

#### Entidad de Pago
**Entidad:** `Pago`

Registro de pagos procesados en el sistema:

**Atributos:**
- `idPago`: Identificador único
- `idOrden`: Orden asociada al pago
- `metodoPago`: Método utilizado (wallet, tarjeta crédito/débito)
- `estadoPago`: Estado del pago (pendiente, completado, fallido)
- `fechaPago`: Timestamp del pago
- `montoPagado`: Monto total pagado

**Métodos de Pago Soportados:**
1. Billetera Virtual (Tarjeta Virtual)
2. Tarjeta de Crédito/Débito (Integración futura)
3. Transferencia Bancaria (Integración futura)

---

## 🔄 FLUJOS DE USUARIO

### Flujo 1: Registro y Configuración de Wallet

```
1. Usuario se registra en la plataforma
   ↓
2. Sistema crea cuenta de usuario
   ↓
3. Usuario solicita crear wallet
   ↓
4. Sistema genera tarjeta virtual con:
   - Número único
   - Saldo inicial 0
   - Estado: activa
   ↓
5. Usuario recibe confirmación con número de tarjeta
```

### Flujo 2: Recarga de Wallet

```
1. Usuario accede a su wallet
   ↓
2. Selecciona opción "Recargar saldo"
   ↓
3. Ingresa monto a recargar
   ↓
4. Sistema crea transacción tipo DEPÓSITO
   ↓
5. Se actualiza saldo disponible
   ↓
6. Usuario recibe confirmación
```

### Flujo 3: Compra de Producto

```
1. Usuario navega catálogo de productos
   ↓
2. Agrega productos al carrito
   ↓
3. Procede al checkout
   ↓
4. Selecciona método de pago: Wallet
   ↓
5. Sistema valida:
   - Wallet activa
   - Saldo suficiente
   - Productos disponibles
   ↓
6. Si validación OK:
   - Crea transacción tipo COMPRA
   - Descuenta de saldo
   - Crea orden
   - Actualiza stock
   ↓
7. Envía notificación en tiempo real (WebSocket)
   ↓
8. Usuario recibe confirmación de compra
```

### Flujo 4: Emprendedor Recibe Venta

```
1. Compra completada exitosamente
   ↓
2. Sistema notifica al emprendedor (WebSocket)
   ↓
3. Emprendedor ve nueva orden en dashboard
   ↓
4. Procesa orden y actualiza estado
   ↓
5. Sistema notifica al comprador
   ↓
6. Al completar entrega, fondos se liberan
```

---

## 📊 MODELO DE DATOS

### Entidades Principales

#### 1. Usuario
```typescript
{
  idUsuario: number (PK)
  nombre: string
  apellido: string
  email: string (unique)
  contrasena: string (hashed)
  direccion: string
  telefono: string
  rol: string (usuario | emprendedor | admin)
  fechaRegistro: Date
}
```

#### 2. Emprendedor
```typescript
{
  idEmprendedor: number (PK)
  idUsuario: number (FK)
  nombreNegocio: string
  descripcion: text
  categoria: string
  telefono: string
  direccion: string
  calificacion: decimal
}
```

#### 3. Producto
```typescript
{
  idProducto: number (PK)
  nombreProducto: string
  descripcion: text
  precio: decimal
  stock: number
  imagenURL: string
  idEmprendedor: number (FK)
  idCategoria: number (FK)
  fechaCreacion: Date
}
```

#### 4. Categoría
```typescript
{
  idCategoria: number (PK)
  nombreCategoria: string
  descripcion: text
}
```

#### 5. CarritoCompra
```typescript
{
  idCarrito: number (PK)
  idUsuario: number (FK)
  fechaCreacion: Date
}
```

#### 6. DetalleCarrito
```typescript
{
  idDetalle: number (PK)
  idCarrito: number (FK)
  idProducto: number (FK)
  cantidad: number
  precioUnitario: decimal
}
```

#### 7. Orden
```typescript
{
  idOrden: number (PK)
  idUsuario: number (FK)
  fechaOrden: Date
  estado: string (pendiente | procesada | enviada | entregada)
  total: decimal
}
```

#### 8. DetalleOrden
```typescript
{
  idDetalleOrden: number (PK)
  idOrden: number (FK)
  idProducto: number (FK)
  cantidad: number
  precioUnitario: decimal
  subtotal: decimal
}
```

#### 9. TarjetaVirtual (Wallet)
```typescript
{
  idTarjeta: number (PK)
  idUsuario: number (FK)
  numeroTarjeta: string (20 chars, unique)
  saldoDisponible: decimal
  fechaExpiracion: Date
  estado: string (activa | bloqueada | expirada)
}
```

#### 10. Transaccion
```typescript
{
  idTransaccion: number (PK)
  idTarjeta: number (FK)
  monto: decimal
  tipo: string (DEPOSITO | COMPRA | RETIRO)
  fecha: Date
}
```

#### 11. Pago
```typescript
{
  idPago: number (PK)
  idOrden: number (FK)
  metodoPago: string
  estadoPago: string (pendiente | completado | fallido)
  fechaPago: Date
  montoPagado: decimal
}
```

### Relaciones

```
Usuario 1 ──→ * TarjetaVirtual
Usuario 1 ──→ * Orden
Usuario 1 ──→ 1 CarritoCompra
Usuario 1 ──→ 1 Emprendedor

Emprendedor 1 ──→ * Producto

Producto * ──→ 1 Categoria
Producto * ──→ * DetalleCarrito
Producto * ──→ * DetalleOrden

CarritoCompra 1 ──→ * DetalleCarrito

Orden 1 ──→ * DetalleOrden
Orden 1 ──→ 1 Pago

TarjetaVirtual 1 ──→ * Transaccion
```

---

## 🔌 API REST ENDPOINTS

### Autenticación
```http
POST   /api/auth/register        # Registro de usuario
POST   /api/auth/login           # Inicio de sesión
```

### Usuarios
```http
GET    /api/usuarios             # Listar usuarios
GET    /api/usuarios/:id         # Obtener usuario
POST   /api/usuarios             # Crear usuario
PUT    /api/usuarios/:id         # Actualizar usuario
DELETE /api/usuarios/:id         # Eliminar usuario
```

### Productos
```http
GET    /api/productos            # Listar productos
GET    /api/productos/:id        # Obtener producto
POST   /api/productos            # Crear producto [AUTH]
PUT    /api/productos/:id        # Actualizar producto [AUTH]
DELETE /api/productos/:id        # Eliminar producto [AUTH]
```

### Emprendedores
```http
GET    /api/emprendedores        # Listar emprendedores
GET    /api/emprendedores/:id    # Obtener emprendedor
POST   /api/emprendedores        # Crear emprendedor
PUT    /api/emprendedores/:id    # Actualizar emprendedor
DELETE /api/emprendedores/:id    # Eliminar emprendedor
```

### Categorías
```http
GET    /api/categorias           # Listar categorías
GET    /api/categorias/:id       # Obtener categoría
POST   /api/categorias           # Crear categoría
PUT    /api/categorias/:id       # Actualizar categoría
DELETE /api/categorias/:id       # Eliminar categoría
```

### Carrito
```http
GET    /api/carrito              # Listar carritos
GET    /api/carrito/:id          # Obtener carrito
POST   /api/carrito              # Crear carrito
PUT    /api/carrito/:id          # Actualizar carrito
DELETE /api/carrito/:id          # Eliminar carrito
```

### Órdenes
```http
GET    /api/orden                # Listar órdenes
GET    /api/orden/:id            # Obtener orden
POST   /api/orden                # Crear orden
PUT    /api/orden/:id            # Actualizar orden
DELETE /api/orden/:id            # Eliminar orden
```

### Tarjetas Virtuales (Wallets)
```http
GET    /api/tarjetas             # Listar tarjetas
GET    /api/tarjetas/:id         # Obtener tarjeta
POST   /api/tarjetas             # Crear tarjeta
PUT    /api/tarjetas/:id         # Actualizar tarjeta
DELETE /api/tarjetas/:id         # Eliminar tarjeta
```

### Transacciones
```http
GET    /api/transacciones        # Listar transacciones
GET    /api/transacciones/:id    # Obtener transacción
POST   /api/transacciones        # Crear transacción
```

### Pagos
```http
GET    /api/pagos                # Listar pagos
GET    /api/pagos/:id            # Obtener pago
POST   /api/pagos                # Procesar pago
PUT    /api/pagos/:id            # Actualizar pago
DELETE /api/pagos/:id            # Eliminar pago
```

---

## 🔍 QUERIES GRAPHQL PRINCIPALES

### Métricas Generales
```graphql
query {
  metricasGenerales {
    totalOrdenes
    totalProductos
    totalIngresos
    totalIngresosFormateado
    crecimientoMensual
    ticketPromedio
  }
}
```

### Productos Más Vendidos
```graphql
query {
  productosMasVendidos(limite: 10) {
    productoId
    nombre
    totalVendido
    ingresosGenerados
    ingresosFormateado
  }
}
```

### Estadísticas por Categoría
```graphql
query {
  estadisticasPorCategoria {
    nombreCategoria
    totalProductos
    ingresosTotales
    participacionMercado
  }
}
```

### Top Compradores
```graphql
query {
  topCompradores(limite: 10) {
    nombreCompleto
    email
    totalOrdenes
    totalGastado
  }
}
```

### Reporte de Inventario
```graphql
query {
  reporteInventario {
    nombre
    stockActual
    estadoStock
    valorInventario
  }
}
```

---

## 🔴 EVENTOS WEBSOCKET EN TIEMPO REAL

### Canales Disponibles

```javascript
// Dashboard general
"dashboard"

// Feed de productos
"products:feed"

// Feed de órdenes
"orders:feed"

// Notificaciones
"notifications"

// Canal privado de usuario
"user:{userId}"

// Canal privado de emprendedor
"emprendedor:{empId}"

// Actualizaciones de producto
"product:{productId}"

// Actualizaciones de orden
"order:{orderId}"
```

### Tipos de Eventos

```javascript
// Eventos de productos
"product:added"
"product:updated"
"product:deleted"
"product:stock_low"

// Eventos de órdenes
"order:created"
"order:updated"
"order:completed"
"order:cancelled"

// Eventos de pagos
"payment:processing"
"payment:completed"
"payment:failed"

// Eventos de wallet
"wallet:deposit"
"wallet:purchase"
"wallet:low_balance"

// Notificaciones
"notification:new"
"notification:read"
```

### Ejemplo de Conexión WebSocket

```javascript
// Conectar al servidor
const ws = new WebSocket('ws://localhost:8000');

// Inicializar
ws.send(JSON.stringify({
  action: "init",
  user_id: "usuario_123",
  emprendedor_id: "emp_456"
}));

// Suscribirse a canales
ws.send(JSON.stringify({
  action: "subscribe",
  channel: "dashboard"
}));

// Recibir eventos
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Evento recibido:', data);
};
```

---

## 🔐 SEGURIDAD

### Autenticación
- JWT (JSON Web Tokens) para autenticación
- Tokens con expiración configurable
- Refresh tokens para sesiones prolongadas

### Autorización
- Roles de usuario: usuario, emprendedor, admin
- Rutas protegidas según rol
- Validación de permisos por recurso

### Encriptación
- Contraseñas hasheadas con Bcrypt
- Comunicación HTTPS en producción
- Variables de entorno para secretos

### Validación de Datos
- Validación de entrada en todas las APIs
- Sanitización de datos
- Prevención de inyección SQL (TypeORM)
- Validación de montos en transacciones

### Wallet Security
- Validación de saldo antes de transacciones
- Registro inmutable de transacciones
- Estados de tarjeta para control de acceso
- Bloqueo automático ante actividad sospechosa

---

## 💻 TECNOLOGÍAS Y HERRAMIENTAS

### Backend
- **Node.js** v16+
- **TypeScript** 
- **Express.js**
- **Ruby** 3.2+
- **Python** 3.9+

### Frameworks
- **Express** (REST API)
- **Sinatra** (GraphQL)
- **GraphQL-Ruby**
- **WebSocket** (Python)

### Base de Datos
- **PostgreSQL** 12+
- **TypeORM** (ORM para Node.js)
- **ActiveRecord** (ORM para Ruby)

### Autenticación
- **JWT** (jsonwebtoken)
- **Bcrypt**

### Comunicación
- **REST API**
- **GraphQL**
- **WebSocket**

### DevOps
- **Docker** (containerización)
- **Git** (control de versiones)

---

## 🚀 INSTALACIÓN Y DESPLIEGUE

### Prerrequisitos
- Node.js v16+
- Ruby 3.2+
- Python 3.9+
- PostgreSQL 12+
- npm o yarn
- bundler (Ruby)
- pip (Python)

### Instalación REST API (Markplace)

```bash
cd Markplace
npm install
# Configurar .env con credenciales de BD
npm run dev  # Puerto 3000
```

### Instalación GraphQL Service

```bash
cd graphql-ruby
bundle install
# Configurar .env con credenciales de BD
ruby app.rb  # Puerto 4000
```

### Instalación WebSocket Service

```bash
cd websoker
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
# Configurar .env
python server_simple.py  # Puerto 8000
```

### Configuración de Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE marketplace_db;

-- Las tablas se crean automáticamente con TypeORM
-- Ejecutar migraciones si es necesario
```

---

## 📈 FUNCIONAMIENTO DEL SISTEMA

### 1. Inicio del Sistema

```
1. Iniciar PostgreSQL
   ↓
2. Iniciar REST API (Puerto 3000)
   ↓
3. Iniciar GraphQL Service (Puerto 4000)
   ↓
4. Iniciar WebSocket Service (Puerto 8000)
   ↓
5. Sistema operativo y listo para recibir peticiones
```

### 2. Flujo de una Compra Completa

```
COMPRADOR:
1. Navega productos (GET /api/productos)
2. Agrega al carrito (POST /api/carrito)
3. Procede al checkout
4. Selecciona pago con wallet
5. Sistema valida saldo (GET /api/tarjetas/:id)
6. Si OK, crea transacción (POST /api/transacciones)
7. Descuenta saldo de wallet
8. Crea orden (POST /api/orden)
9. WebSocket notifica en tiempo real
10. Recibe confirmación

EMPRENDEDOR:
1. Recibe notificación WebSocket
2. Ve nueva orden en dashboard (GraphQL)
3. Procesa orden
4. Actualiza estado (PUT /api/orden/:id)
5. WebSocket notifica al comprador
6. Sistema actualiza estadísticas
```

### 3. Gestión de Wallet

```
USUARIO:
1. Crea wallet (POST /api/tarjetas)
   → Sistema genera número único
   → Saldo inicial: 0
   → Estado: activa

2. Recarga saldo (POST /api/transacciones)
   → Tipo: DEPÓSITO
   → Monto: X
   → Actualiza saldo

3. Compra producto
   → Sistema valida saldo
   → Crea transacción tipo COMPRA
   → Descuenta del saldo
   → Registra en historial

4. Consulta historial (GET /api/transacciones)
   → Ve todas sus transacciones
   → Filtra por tipo
   → Descarga reportes
```

---

## 📊 DASHBOARD Y REPORTES

### Métricas Disponibles

1. **Ventas Totales**
   - Ingresos por periodo
   - Cantidad de órdenes
   - Ticket promedio
   - Crecimiento mensual

2. **Productos**
   - Más vendidos
   - Bajo stock
   - Por categoría
   - Valor de inventario

3. **Usuarios**
   - Top compradores
   - Nuevos registros
   - Usuarios activos
   - Retención

4. **Wallets**
   - Saldo total en sistema
   - Transacciones por día
   - Métodos de pago más usados
   - Promedio de recargas

5. **Emprendedores**
   - Ventas por emprendedor
   - Productos listados
   - Calificaciones
   - Comisiones generadas

### Consultas GraphQL para Dashboard

```graphql
# Dashboard Principal
query DashboardPrincipal {
  metricasGenerales {
    totalOrdenes
    totalIngresos
    ticketPromedio
  }
  
  productosMasVendidos(limite: 5) {
    nombre
    totalVendido
  }
  
  topCompradores(limite: 5) {
    nombreCompleto
    totalGastado
  }
}

# Reporte de Ventas Mensual
query ReporteMensual {
  reporteIngresos(agrupacion: "mes") {
    periodo
    totalOrdenes
    ingresosBrutos
    ticketPromedio
  }
}
```

---

## 🎯 CASOS DE USO PRINCIPALES

### Caso de Uso 1: Registro de Emprendedor

**Actor:** Nuevo Emprendedor

**Flujo Principal:**
1. Usuario accede a página de registro
2. Selecciona rol "emprendedor"
3. Ingresa datos personales y de negocio
4. Sistema valida información
5. Crea cuenta de usuario
6. Crea perfil de emprendedor vinculado
7. Genera wallet automáticamente
8. Envía email de confirmación
9. Emprendedor puede acceder al dashboard

**Postcondiciones:**
- Usuario creado con rol emprendedor
- Perfil de emprendedor configurado
- Wallet activa con saldo 0

### Caso de Uso 2: Publicación de Producto

**Actor:** Emprendedor

**Precondiciones:**
- Emprendedor autenticado
- Tiene wallet activa

**Flujo Principal:**
1. Accede a "Mis Productos"
2. Click en "Nuevo Producto"
3. Completa formulario:
   - Nombre
   - Descripción
   - Precio
   - Stock
   - Categoría
   - Imagen
4. Sistema valida datos
5. Crea producto vinculado al emprendedor
6. WebSocket notifica a usuarios suscritos
7. Producto aparece en catálogo

**Postcondiciones:**
- Producto publicado y visible
- Inventario actualizado
- Notificaciones enviadas

### Caso de Uso 3: Compra con Wallet

**Actor:** Comprador

**Precondiciones:**
- Usuario autenticado
- Tiene wallet con saldo suficiente
- Productos en carrito

**Flujo Principal:**
1. Usuario revisa carrito
2. Click en "Proceder al pago"
3. Selecciona wallet como método de pago
4. Sistema calcula total
5. Valida saldo disponible
6. Usuario confirma compra
7. Sistema:
   - Crea transacción COMPRA
   - Descuenta saldo
   - Crea orden
   - Actualiza stock
   - Genera pago
8. WebSocket notifica a emprendedor
9. Usuario recibe confirmación

**Flujo Alternativo A: Saldo Insuficiente**
5a. Sistema detecta saldo insuficiente
5b. Muestra mensaje de error
5c. Ofrece opción de recargar wallet
5d. Fin del caso de uso

**Postcondiciones:**
- Orden creada con estado "pendiente"
- Saldo debitado
- Transacción registrada
- Stock actualizado

### Caso de Uso 4: Recarga de Wallet

**Actor:** Usuario

**Precondiciones:**
- Usuario autenticado
- Tiene wallet creada

**Flujo Principal:**
1. Usuario accede a "Mi Wallet"
2. Click en "Recargar saldo"
3. Ingresa monto a recargar
4. Selecciona método de recarga (simulado)
5. Sistema procesa recarga:
   - Crea transacción DEPÓSITO
   - Aumenta saldo
   - Registra operación
6. WebSocket notifica actualización
7. Usuario ve nuevo saldo

**Postcondiciones:**
- Saldo incrementado
- Transacción registrada
- Historial actualizado

---

## 🔄 INTEGRACIONES

### Integración Frontend - Backend REST

```typescript
// Ejemplo de integración con fetch
async function obtenerProductos() {
  const response = await fetch('http://localhost:3000/api/productos');
  const productos = await response.json();
  return productos;
}

async function crearOrden(ordenData, token) {
  const response = await fetch('http://localhost:3000/api/orden', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(ordenData)
  });
  return response.json();
}
```

### Integración Frontend - GraphQL

```typescript
// Con Apollo Client
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

async function obtenerMetricas() {
  const { data } = await client.query({
    query: gql`
      query {
        metricasGenerales {
          totalOrdenes
          totalIngresos
        }
      }
    `
  });
  return data.metricasGenerales;
}
```

### Integración Frontend - WebSocket

```typescript
// Cliente WebSocket TypeScript
import { WebSocketClient } from './services/websocket.client';

const wsClient = new WebSocketClient('ws://localhost:8000');

// Conectar
await wsClient.connect();

// Suscribirse a eventos
wsClient.subscribe('dashboard', (data) => {
  console.log('Actualización del dashboard:', data);
  updateUI(data);
});

// Enviar evento
wsClient.send({
  action: 'get_stats'
});
```

---

## 📋 REQUISITOS NO FUNCIONALES

### Performance
- Tiempo de respuesta API < 200ms
- Carga de dashboard < 1s
- Soporte para 1000 usuarios concurrentes
- WebSocket con latencia < 100ms

### Escalabilidad
- Arquitectura de microservicios
- Base de datos optimizada con índices
- Caché para consultas frecuentes
- Load balancing para alta demanda

### Disponibilidad
- Uptime objetivo: 99.5%
- Backups diarios automáticos
- Recuperación ante fallos < 1 hora

### Usabilidad
- Interfaz intuitiva y responsive
- Soporte para móviles
- Mensajes de error claros
- Ayuda contextual

### Mantenibilidad
- Código bien documentado
- Arquitectura modular
- Tests automatizados
- Logs detallados

---

## 🎨 INTERFAZ DE USUARIO (FRONTEND)

### Páginas Principales

1. **Landing Page**
   - Hero con descripción del marketplace
   - Productos destacados
   - Categorías populares
   - Emprendedores destacados

2. **Catálogo de Productos**
   - Grid de productos
   - Filtros por categoría, precio
   - Búsqueda
   - Paginación

3. **Detalle de Producto**
   - Imágenes del producto
   - Descripción completa
   - Precio y stock
   - Información del emprendedor
   - Botón "Agregar al carrito"

4. **Carrito de Compras**
   - Lista de productos
   - Cantidades ajustables
   - Total calculado
   - Botón "Proceder al pago"

5. **Checkout**
   - Resumen de orden
   - Selección de método de pago
   - Formulario de dirección
   - Confirmación

6. **Dashboard de Usuario**
   - Mis órdenes
   - Mi wallet
   - Historial de transacciones
   - Perfil

7. **Dashboard de Emprendedor**
   - Mis productos
   - Órdenes recibidas
   - Estadísticas de ventas
   - Gestión de inventario

8. **Mi Wallet**
   - Saldo disponible
   - Botón de recarga
   - Historial de transacciones
   - Gráficas de gastos

---

## 🧪 TESTING

### Pruebas Unitarias
- Controllers
- Services
- Modelos

### Pruebas de Integración
- Flujo completo de compra
- Sistema de wallet
- WebSocket events

### Pruebas de API
- Postman/Thunder Client collections
- Validación de respuestas
- Manejo de errores

### Pruebas de Seguridad
- Validación de JWT
- Inyección SQL
- XSS
- CSRF

---

## 📝 DOCUMENTACIÓN ADICIONAL

### Para Desarrolladores
- README.md en cada servicio
- Comentarios en código
- API documentation (Swagger futuro)
- GraphQL Playground

### Para Usuarios
- Manual de usuario
- FAQs
- Tutoriales en video
- Soporte por email

---

## 🚧 ROADMAP FUTURO

### Fase 2 (Próximos 3 meses)
- [ ] Integración con pasarelas de pago reales
- [ ] Sistema de reviews y calificaciones
- [ ] Chat en tiempo real entre comprador y vendedor
- [ ] App móvil (React Native)
- [ ] Integración con blockchain real para crypto

### Fase 3 (6 meses)
- [ ] Sistema de envíos con tracking
- [ ] Programa de afiliados
- [ ] Marketplace multimoneda
- [ ] AI para recomendaciones de productos
- [ ] Panel de analytics avanzado

### Fase 4 (1 año)
- [ ] Internacionalización
- [ ] Sistema de subastas
- [ ] NFT marketplace
- [ ] DeFi integrations
- [ ] Staking de tokens

---

## 📞 SOPORTE Y CONTACTO

### Equipo de Desarrollo
- **REST API (TypeScript):** Integrante 2
- **GraphQL (Ruby):** Integrante 3  
- **WebSocket (Python):** Integrante 1

### Repositorio
GitHub: nicolemoreira12/PROYECTO-AUTONOMO

### Universidad
ULEAM - Curso de Servidor Web 2024

---

## 📄 LICENCIA

Proyecto académico desarrollado para ULEAM 2024.

---

## 🎯 CONCLUSIÓN

**Marketplace Mantense Ecuador** es una plataforma completa de e-commerce que combina tecnologías modernas con un enfoque en emprendedores ecuatorianos. El sistema de **billetera virtual y criptomonedas** proporciona una solución innovadora para pagos seguros y descentralizados.

La arquitectura de **microservicios** permite escalabilidad y mantenimiento eficiente, mientras que la integración de **WebSocket** proporciona una experiencia de usuario moderna con actualizaciones en tiempo real.

El proyecto demuestra competencia en:
- Desarrollo fullstack con múltiples tecnologías
- Arquitectura de microservicios
- Integración de sistemas complejos
- Gestión de transacciones financieras
- Comunicación en tiempo real
- Bases de datos relacionales
- APIs RESTful y GraphQL

---

**Documento de Especificación del Producto v1.0**  
**Fecha:** Noviembre 2024  
**Estado:** Completo y Operativo
