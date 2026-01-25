# Marketplace Frontend

Frontend desarrollado con React, TypeScript y Clean Architecture.

## 🏗️ Arquitectura

Este proyecto sigue los principios de Clean Architecture, dividiendo el código en capas claramente definidas:

```
src/
├── domain/              # Capa de Dominio (Entidades y Reglas de Negocio)
│   ├── entities/        # Entidades del dominio
│   ├── repositories/    # Interfaces de repositorios
│   └── value-objects/   # Objetos de valor
├── application/         # Capa de Aplicación (Casos de Uso)
│   └── use-cases/       # Casos de uso de la aplicación
├── infrastructure/      # Capa de Infraestructura (Implementaciones)
│   ├── api/            # Cliente HTTP y configuración
│   ├── repositories/   # Implementaciones de repositorios
│   └── services/       # Servicios externos
└── presentation/        # Capa de Presentación (UI)
    ├── components/     # Componentes React
    ├── pages/          # Páginas de la aplicación
    ├── hooks/          # Custom hooks
    ├── contexts/       # Context API
    └── store/          # Estado global (Zustand)
```

## 🚀 Tecnologías

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Zustand** - Gestión de estado

## 📦 Instalación

```bash
npm install
```

## 🏃‍♂️ Desarrollo

```bash
npm run dev
```

## � Modo Offline / Demo

El frontend funciona completamente **sin backend** usando datos simulados:

### ✅ Funcionalidades en Modo Offline:
- **Autenticación**: Registro y login con usuarios mock almacenados en localStorage
- **Productos**: Catálogo de productos de ejemplo (ver `productos-ejemplo.ts`)
- **Carrito**: Gestión completa del carrito en localStorage
- **Pagos**: Simulador de pasarela de pago con:
  - 5 métodos de pago (Tarjeta, Wallet, Crypto, Transferencia, Efectivo)
  - Validación Luhn para números de tarjeta
  - Simulación realista con delay configurable (2.5s)
  - Tasa de éxito configurable (95%)
- **Órdenes**: Creación y visualización de órdenes con tracking simulado
- **WebSocket**: Silenciado en modo offline (no spam en consola)

### 🎯 Usuarios Demo:
Al registrarte o iniciar sesión sin backend, se crea automáticamente un usuario con:
- Token: `demo-token-{timestamp}`
- Datos extraídos del email ingresado
- Rol seleccionado (usuario/emprendedor)
- Persistencia en localStorage

### ⚙️ Variables de Entorno:
```env
VITE_ENABLE_REAL_PAYMENTS=false      # Usar MockPaymentService
VITE_MOCK_PAYMENT_DELAY=2500         # Delay simulación (ms)
VITE_MOCK_PAYMENT_SUCCESS_RATE=95    # % de éxito pagos
```

## 🤖 Asistente IA

El marketplace incluye un **asistente inteligente** que ayuda a los usuarios con:

### ✅ Funcionalidades:
- 💡 **Recomendaciones de productos**: Basadas en preferencias del usuario
- 📦 **Información de categorías**: Explora el catálogo completo
- 🛒 **Ayuda con compras**: Guía paso a paso del proceso
- 💳 **Métodos de pago**: Información sobre opciones de pago
- 📦 **Envíos y entregas**: Tiempos y costos de envío
- 🔍 **Búsqueda inteligente**: Encuentra productos por descripción natural

### 🎯 Uso:
1. Haz clic en el **botón flotante** (robot púrpura) en la esquina inferior derecha
2. Escribe tu pregunta en lenguaje natural
3. Usa los **botones de sugerencias** para navegación rápida

### 💬 Ejemplos de Preguntas:
- "¿Qué productos recomiendas?"
- "Busco una laptop gaming"
- "¿Cuánto cuesta el envío?"
- "¿Qué métodos de pago aceptan?"
- "Necesito ayuda para comprar"

### 🔌 Modo Offline:
El asistente funciona **completamente sin backend** usando:
- Respuestas basadas en patrones inteligentes
- Recomendaciones de productos de ejemplo
- Búsqueda en catálogo estático
- Simulación de delay realista (800ms)

Ver documentación completa en: [`IA-ASSISTANT.md`](./IA-ASSISTANT.md)

### 🔧 Activar Backend Real:
1. Levantar servicios: `Markplace` (3000), `auth-service` (4000), `payment-service` (5000)
2. Cambiar: `VITE_ENABLE_REAL_PAYMENTS=true`
3. Reiniciar dev server

## �🔨 Build

```bash
npm run build
```

## 📝 Principios de Clean Architecture

1. **Independencia de Frameworks**: El código de negocio no depende de frameworks externos
2. **Testeable**: La lógica de negocio puede ser testeada sin UI, BD, o servicios externos
3. **Independencia de UI**: La UI puede cambiar sin afectar el resto del sistema
4. **Independencia de BD**: Puedes cambiar de BD sin afectar las reglas de negocio
5. **Independencia de Servicios Externos**: Las reglas de negocio no conocen el mundo exterior

## 🔄 Flujo de Datos

```
Presentation → Application → Infrastructure
     ↓              ↓              ↓
  UI/UX       Use Cases      API/Services
     ↑              ↑              ↑
  Domain    ←    Domain    ←    Domain
```
