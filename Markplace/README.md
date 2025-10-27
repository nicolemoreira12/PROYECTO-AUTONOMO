# 🛍 Marketplace Mantense Ecuador - API REST

API REST para una plataforma de e-commerce de productos artesanales ecuatorianos.

## 📋 Descripción

Sistema backend que permite la gestión completa de un marketplace mantanse en donde se incluye productos, usuarios, categorías, carritos de compra, órdenes, pagos y transacciones, etc. 
Implementa autenticación con JWT para proteger rutas críticas.

---

## 🚀 Tecnologías Utilizadas

- *Node.js* - Entorno de ejecución
- *TypeScript* - Lenguaje de programación
- *Express* - Framework web
- *TypeORM* - ORM para base de datos
- *PostgreSQL* - Base de datos
- *JWT* - Autenticación
- *Bcrypt* - Encriptación de contraseñas

---

## 📦 Instalación

### Pre requisitos

- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### Pasos

1. *Clonar el repositorio*
bash
git clone https://github.com/nicolemoreira12/PROYECTO-AUTONOMO.git
cd PROYECTO-AUTONOMO/Markplace


2. ## Instalar dependencias
bash
npm install


3. ## Configurar base de dato

Editar src/config/data-source.ts con tus credenciales de PostgreSQL:
typescript
host: "localhost",
port: 5432,
username: "tu_usuario",
password: "tu_contraseña",
database: "tu_base_de_datos"


4. ## Iniciar el servidor
bash
npm run dev


El servidor estará corriendo en http://localhost:3000

---

## 🔐 Autenticación

La API utiliza *JWT (JSON Web Tokens)* para proteger rutas específicas.

### Registrar un usuario
http
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "María",
  "apellido": "González",
  "email": "maria@ejemplo.com",
  "contrasena": "123456",
  "direccion": "Quito, Ecuador",
  "telefono": "0999999999",
  "rol": "usuario"
}


*Respuesta:*
json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "idUsuario": 1,
    "nombre": "María",
    "apellido": "González",
    "email": "maria@ejemplo.com",
    "rol": "usuario"
  }
}


### Iniciar sesión
http
POST /api/auth/login
Content-Type: application/json

{
  "email": "maria@ejemplo.com",
  "password": "123456"
}


### Usar el token

Para rutas protegidas, incluir el token en el header:
http
Authorization: Bearer {tu_token_aquí}


---

## 📚 Endpoints

### 🔑 Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Registrar nuevo usuario | No |
| POST | /api/auth/login | Iniciar sesión | No |

---

### 👤 Usuarios

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/usuarios | Listar todos los usuarios | No |
| GET | /api/usuarios/:id | Obtener un usuario por ID | No |
| POST | /api/usuarios | Crear un usuario | No |
| PUT | /api/usuarios/:id | Actualizar un usuario | No |
| DELETE | /api/usuarios/:id | Eliminar un usuario | No |

---

### 📦 Productos

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/productos | Listar todos los productos | No |
| GET | /api/productos/:id | Obtener un producto por ID | No |
| POST | /api/productos | Crear un producto | *Sí* |
| PUT | /api/productos/:id | Actualizar un producto | *Sí* |
| DELETE | /api/productos/:id | Eliminar un producto | *Sí* |

*Ejemplo - Crear producto:*
http
POST /api/productos
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombreProducto": "Sombrero de Paja Toquilla",
  "descripcion": "Artesanía tradicional ecuatoriana",
  "precio": 45.99,
  "stock": 10,
  "imagenURL": "https://ejemplo.com/sombrero.jpg"
}


---

### 🏷 Categorías

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/categorias | Listar todas las categorías | No |
| GET | /api/categorias/:id | Obtener una categoría por ID | No |
| POST | /api/categorias | Crear una categoría | No |
| PUT | /api/categorias/:id | Actualizar una categoría | No |
| DELETE | /api/categorias/:id | Eliminar una categoría | No |

---

### 🏪 Emprendedores

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/emprendedores | Listar todos los emprendedores | No |
| GET | /api/emprendedores/:id | Obtener un emprendedor por ID | No |
| POST | /api/emprendedores | Crear un emprendedor | No |
| PUT | /api/emprendedores/:id | Actualizar un emprendedor | No |
| DELETE | /api/emprendedores/:id | Eliminar un emprendedor | No |

---

### 🛒 Carrito de Compras

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/carrito | Listar todos los carritos | No |
| GET | /api/carrito/:id | Obtener un carrito por ID | No |
| POST | /api/carrito | Crear un carrito | No |
| PUT | /api/carrito/:id | Actualizar un carrito | No |
| DELETE | /api/carrito/:id | Eliminar un carrito | No |

---

### 📝 Detalle de Carrito

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/detallecarrito | Listar todos los detalles | No |
| GET | /api/detallecarrito/:id | Obtener un detalle por ID | No |
| POST | /api/detallecarrito | Crear un detalle | No |
| PUT | /api/detallecarrito/:id | Actualizar un detalle | No |
| DELETE | /api/detallecarrito/:id | Eliminar un detalle | No |

---

### 📋 Órdenes

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/orden | Listar todas las órdenes | No |
| GET | /api/orden/:id | Obtener una orden por ID | No |
| POST | /api/orden | Crear una orden | No |
| PUT | /api/orden/:id | Actualizar una orden | No |
| DELETE | /api/orden/:id | Eliminar una orden | No |

---

### 📄 Detalle de Orden

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/detalleorden | Listar todos los detalles | No |
| GET | /api/detalleorden/:id | Obtener un detalle por ID | No |
| POST | /api/detalleorden | Crear un detalle | No |
| PUT | /api/detalleorden/:id | Actualizar un detalle | No |
| DELETE | /api/detalleorden/:id | Eliminar un detalle | No |

---

### 💳 Pagos

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/pagos | Listar todos los pagos | No |
| GET | /api/pagos/:id | Obtener un pago por ID | No |
| POST | /api/pagos | Crear un pago | No |
| PUT | /api/pagos/:id | Actualizar un pago | No |
| DELETE | /api/pagos/:id | Eliminar un pago | No |

---

### 💰 Tarjetas Virtuales

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/tarjetas | Listar todas las tarjetas | No |
| GET | /api/tarjetas/:id | Obtener una tarjeta por ID | No |
| POST | /api/tarjetas | Crear una tarjeta | No |
| PUT | /api/tarjetas/:id | Actualizar una tarjeta | No |
| DELETE | /api/tarjetas/:id | Eliminar una tarjeta | No |

---

### 💸 Transacciones

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/transacciones | Listar todas las transacciones | No |
| GET | /api/transacciones/:id | Obtener una transacción por ID | No |
| POST | /api/transacciones | Crear una transacción | No |

---

## 🗂 Estructura del Proyecto


Markplace/
├── src/
│   ├── config/
│   │   └── data-source.ts          # Configuración de TypeORM
│   ├── controllers/                # Controladores (manejo HTTP)
│   │   ├── auth.controller.ts
│   │   ├── Producto.controller.ts
│   │   ├── usuario.controller.ts
│   │   └── ...
│   ├── services/                   # Servicios (lógica de negocio)
│   │   ├── auth.service.ts
│   │   ├── Producto.service.ts
│   │   ├── usuario.service.ts
│   │   └── ...
│   ├── entities/                   # Modelos de base de datos
│   │   ├── Usuario.ts
│   │   ├── Producto.ts
│   │   ├── Categoria.ts
│   │   └── ...
│   ├── routes/                     # Definición de rutas
│   │   ├── Auth.routes.ts
│   │   ├── Producto.routes.ts
│   │   ├── Usuario.routes.ts
│   │   └── ...
│   ├── middlewares/                # Middlewares
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   └── index.ts                    # Punto de entrada
├── package.json
├── tsconfig.json
└── README.md


---

## 🏗 Arquitectura

El proyecto sigue una arquitectura en capas:


Cliente → Rutas → Middlewares → Controladores → Servicios → Base de Datos


- *Rutas*: Definen los endpoints y vinculan con controladores
- *Middlewares*: Interceptan requests (autenticación, validación)
- *Controladores*: Manejan peticiones HTTP y respuestas
- *Servicios*: Contienen la lógica de negocio
- *Entidades*: Representan las tablas de la base de datos

---

## 📊 Modelos de Datos

### Usuario
- idUsuario (PK)
- nombre
- apellido
- email (unique)
- contrasena (hasheada)
- direccion
- telefono
- rol
- fechaRegistro

### Producto
- idProducto (PK)
- nombreProducto
- descripcion
- precio
- stock
- imagenURL
- emprendedor (FK)
- categoria (FK)

### Orden
- idOrden (PK)
- fechaOrden
- estado
- total
- usuario (FK)

(Y más entidades...)

---

## ⚠ Manejo de Errores

La API devuelve códigos de estado HTTP estándar:

- 200 - OK
- 201 - Creado exitosamente
- 400 - Error en la petición
- 401 - No autenticado
- 403 - Token inválido
- 404 - Recurso no encontrado
- 500 - Error del servidor

*Ejemplo de respuesta de error:*
json
{
  "message": "Usuario no encontrado"
}


---

## 🧪 Pruebas

Para probar la API, se recomienda usar:
- *Postman* - Cliente HTTP
- *Thunder Client* - Extensión de VS Code
- *curl* - Línea de comandos

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico universitario.

---

## 🔮 Próximas Características

- [ ] Integración con WebSocket (notificaciones en tiempo real)
- [ ] Integración con GraphQL (consultas avanzadas)
- [ ] Frontend web completo
- [ ] Roles y permisos avanzados
- [ ] Validaciones más robustas con class-validator
- [ ] Sistema de reportes

---