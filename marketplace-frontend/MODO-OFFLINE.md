# 🔌 Modo Offline - Guía Completa

## 📋 Descripción

El frontend está completamente funcional **sin necesidad de backend**. Todos los servicios tienen fallback a datos simulados cuando los microservicios no están disponibles.

## ✅ Estado Actual

### Servicios con Modo Offline Implementado:

#### 1️⃣ Autenticación (`AuthRepositoryImpl.ts`)
- ✅ **Login**: Genera usuario mock si backend no responde
- ✅ **Registro**: Crea usuario demo en localStorage
- ✅ **getCurrentUser**: Lee usuario de localStorage si backend falla
- ✅ **Logout**: Limpia localStorage (no necesita backend)

**Ejemplo de Usuario Mock:**
```typescript
{
  id: 843,
  nombre: "usuario",
  apellido: "Usuario Demo",
  email: "usuario@ejemplo.com",
  rol: "usuario",
  direccion: "Dirección Demo",
  telefono: "1234567890"
}
```

#### 2️⃣ Productos (`ProductoRepositoryImpl.ts`)
- ✅ **getAll**: Devuelve `productosEjemplo` (25 productos)
- ✅ **getById**: Busca en productos de ejemplo
- ⚠️ **create/update/delete**: Requieren backend (no disponibles en modo offline)

**Productos de Ejemplo:**
- 25 productos distribuidos en 5 categorías
- Imágenes de placeholder desde Unsplash
- Precios realistas ($10 - $150)
- Stock simulado (10-50 unidades)

#### 3️⃣ Carrito (`carritoStore.ts`)
- ✅ **100% localStorage**: No necesita backend
- ✅ Persistencia automática con Zustand
- ✅ Funciones: agregar, actualizar, eliminar, limpiar

#### 4️⃣ Pagos (`MockPaymentService.ts`)
- ✅ Simulador completo de pasarela de pago
- ✅ **5 métodos de pago**:
  1. Tarjeta de crédito/débito (con validación Luhn)
  2. Wallet digital (PayPal, Mercado Pago, etc.)
  3. Criptomonedas (Bitcoin, Ethereum, USDT)
  4. Transferencia bancaria
  5. Efectivo (contra entrega)

**Validaciones Implementadas:**
- ✅ Algoritmo Luhn para números de tarjeta
- ✅ Fecha de expiración (formato MM/YY)
- ✅ CVV (3-4 dígitos)
- ✅ Billeteras digitales (emails)
- ✅ Direcciones de crypto (regex patterns)

**Configuración:**
```env
VITE_ENABLE_REAL_PAYMENTS=false        # Mock activo
VITE_MOCK_PAYMENT_DELAY=2500           # 2.5 segundos de simulación
VITE_MOCK_PAYMENT_SUCCESS_RATE=95      # 95% de pagos exitosos
```

#### 5️⃣ Órdenes (`payment.use-cases.ts`)
- ✅ **Flujo completo simulado**:
  1. Crear orden → genera ID único
  2. Procesar pago → usa MockPaymentService
  3. Actualizar estado → simula confirmación
  4. Limpiar carrito → borra localStorage
  5. Redirección → `/orden/{ordenId}`

#### 6️⃣ WebSocket (`WebSocketService.ts`)
- ✅ **Logs silenciados** en modo offline
- ✅ Reintentos de conexión sin spam en consola
- ✅ Notificaciones de estado (conectado/desconectado)
- ⚠️ Sin eventos en tiempo real (requiere backend)

## 🎮 Cómo Usar el Modo Offline

### Paso 1: Levantar el Frontend
```bash
cd marketplace-frontend
npm install
npm run dev
```

### Paso 2: Acceder a la Aplicación
Abre en el navegador: **http://localhost:5173/**

### Paso 3: Crear Usuario Demo
1. Ir a "Registrarse"
2. Ingresar cualquier email (ej: `demo@marketplace.com`)
3. Ingresar cualquier contraseña (no se valida en modo offline)
4. Seleccionar rol: Usuario o Emprendedor
5. Click en "Registrarse"

**Resultado:**
- Usuario creado en localStorage
- Token demo generado: `demo-token-{timestamp}`
- Sesión iniciada automáticamente

### Paso 4: Navegar por los Productos
- Página principal muestra 25 productos de ejemplo
- Filtros funcionales (categorías, precio)
- Búsqueda por nombre
- Vista de detalle de producto

### Paso 5: Agregar al Carrito
- Click en "Agregar al Carrito"
- Seleccionar cantidad
- Ícono del carrito se actualiza

### Paso 6: Realizar Checkout
1. Ir al carrito (ícono arriba derecha)
2. Revisar productos y total
3. Click en "Proceder al Pago"
4. **Wizard de Pago (4 pasos)**:

#### Paso 1: Seleccionar Método de Pago
- Radio buttons con 5 opciones
- Descripción de cada método

#### Paso 2: Ingresar Datos de Pago
**Ejemplo para Tarjeta:**
```
Número: 4532015112830366 (válido con Luhn)
Titular: Juan Pérez
Expiración: 12/25
CVV: 123
```

**Ejemplo para Wallet:**
```
Email: usuario@paypal.com
Tipo: PayPal
```

#### Paso 3: Procesando...
- Animación de carga
- 3 indicadores de progreso:
  1. ✓ Validando datos
  2. ✓ Procesando pago
  3. ✓ Confirmando transacción

#### Paso 4: Confirmación
- Mensaje de éxito/error
- ID de transacción generado
- Botón "Ver Orden"

### Paso 7: Ver Orden
- Página de confirmación con:
  - Detalles de la orden
  - Tracking simulado (5 pasos)
  - Lista de productos
  - Información de pago
  - Datos del cliente

## 🐛 Errores en Consola (Esperados)

Al estar en modo offline, verás estos errores **que son normales**:

### ❌ Backend No Disponible:
```
GET http://localhost:3000/api/productos net::ERR_CONNECTION_REFUSED
POST http://localhost:4000/auth/register net::ERR_CONNECTION_REFUSED
```
**Solución:** ✅ Ya implementada - los repositorios usan datos mock

### ❌ WebSocket No Conecta:
```
WebSocket connection to 'ws://127.0.0.1:8000/' failed
```
**Solución:** ✅ Ya silenciado - no afecta funcionalidad

## 🔧 Activar Backend Real

Si quieres conectar con los servicios reales:

### 1. Levantar Microservicios

#### Markplace (Puerto 3000):
```bash
cd Markplace
npm install
npm run dev
```

#### Auth Service (Puerto 4000):
```bash
cd Autonomo2/auth-service
npm install
npm run dev
```

#### Payment Service (Puerto 5000):
```bash
cd Autonomo2/payment-service
npm install
npm run dev
```

#### WebSocket Service (Puerto 8000):
```bash
cd websoker
pip install -r requirements.txt
python run.py
```

### 2. Configurar Variables de Entorno
Editar `marketplace-frontend/.env`:
```env
VITE_ENABLE_REAL_PAYMENTS=true
VITE_API_URL=http://localhost:3000/api
VITE_AUTH_URL=http://localhost:4000
VITE_PAYMENT_URL=http://localhost:5000
VITE_WEBSOCKET_URL=ws://127.0.0.1:8000
```

### 3. Reiniciar Frontend
```bash
# Ctrl+C para detener el servidor actual
npm run dev
```

## 📊 Comparación: Offline vs Online

| Funcionalidad | Modo Offline | Modo Online |
|--------------|--------------|-------------|
| **Login/Registro** | ✅ Mock localStorage | ✅ JWT real + DB |
| **Productos** | ✅ 25 ejemplos estáticos | ✅ DB dinámica |
| **Carrito** | ✅ localStorage | ✅ DB + localStorage |
| **Pagos** | ✅ Simulación realista | ✅ Gateway real |
| **Órdenes** | ✅ Mock local | ✅ DB + tracking |
| **WebSocket** | ⚠️ Silenciado | ✅ Eventos real-time |
| **AI Chat** | ❌ No disponible | ✅ MCP Tools |
| **Reportes** | ❌ No disponible | ✅ GraphQL |

## 🎯 Casos de Uso Ideales

### Modo Offline es Perfecto Para:
- ✅ **Demos**: Mostrar funcionalidad sin infraestructura
- ✅ **Desarrollo frontend**: Trabajar sin levantar backend
- ✅ **Testing UI**: Probar flujos de usuario
- ✅ **Prototipado**: Validar diseño y UX
- ✅ **Presentaciones**: Sin dependencias externas

### Modo Online es Necesario Para:
- 🔐 **Seguridad real**: Autenticación con JWT
- 💾 **Persistencia**: Datos guardados en base de datos
- 🔄 **Sincronización**: Múltiples usuarios
- 💳 **Pagos reales**: Integración con gateways
- 📊 **Analytics**: Métricas y reportes
- 🤖 **IA**: Asistente con MCP Tools

## 📝 Notas Técnicas

### Implementación del Modo Offline:

#### Patrón Try-Catch en Repositorios:
```typescript
async login(email: string, password: string): Promise<AuthResponse> {
    try {
        // Intentar con backend real
        const response = await httpClient.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        // Fallback a datos mock
        console.warn('⚠️ Backend no disponible, usando modo demo');
        return generateMockAuthResponse(email);
    }
}
```

#### Ventajas de este Enfoque:
- ✅ **Transparente**: La capa de presentación no sabe si es mock o real
- ✅ **Mantenible**: Fácil agregar/quitar modo offline
- ✅ **Testeable**: Se pueden probar ambos modos
- ✅ **Resiliente**: App funciona incluso con backend caído

### Datos Mock Ubicados en:
- `productos-ejemplo.ts`: Catálogo de productos
- `MockPaymentService.ts`: Lógica de pagos simulados
- `AuthRepositoryImpl.ts`: Generación de usuarios demo
- `carritoStore.ts`: Gestión de carrito en memoria

## 🚀 Próximas Mejoras

### Funcionalidades Pendientes en Modo Offline:
- [ ] Mock de órdenes históricas
- [ ] Simulación de emprendedores (crear productos)
- [ ] Dashboard con datos demo
- [ ] AI Chat con respuestas predefinidas
- [ ] Reportes con gráficos estáticos

### Optimizaciones:
- [ ] Service Worker para PWA
- [ ] IndexedDB en lugar de localStorage
- [ ] Sincronización automática al reconectar
- [ ] Cache de imágenes

## ❓ FAQ

**P: ¿Por qué veo errores en consola?**
R: Es normal. Los errores de conexión están silenciados y el frontend usa datos mock automáticamente.

**P: ¿Mis datos se guardan?**
R: Sí, en localStorage del navegador. Si limpias cache/cookies, se pierden.

**P: ¿Puedo probar todos los flujos?**
R: Sí, registro, login, productos, carrito, pago y órdenes funcionan 100% offline.

**P: ¿Cómo sé si estoy en modo offline?**
R: Mira la consola - verás mensajes "⚠️ Backend no disponible, usando modo demo".

**P: ¿Funciona en producción?**
R: El modo offline es para desarrollo/demo. En producción se debe usar backend real.

## 📞 Soporte

Si encuentras problemas:
1. Verifica que estés en: http://localhost:5173/
2. Revisa la consola del navegador (F12)
3. Limpia localStorage: `localStorage.clear()`
4. Recarga la página: `Ctrl+Shift+R`

---

**✨ ¡El frontend está listo para usar sin backend! ✨**
