# 🔐 Guía de Configuración de Stripe - Payment Service

Esta guía te ayudará a configurar Stripe correctamente para el servicio de pagos.

## 📋 Índice

1. [Crear cuenta en Stripe](#1-crear-cuenta-en-stripe)
2. [Obtener las API Keys](#2-obtener-las-api-keys)
3. [Configurar Webhooks](#3-configurar-webhooks)
4. [Configurar variables de entorno](#4-configurar-variables-de-entorno)
5. [Probar la integración](#5-probar-la-integración)
6. [Pasar a producción](#6-pasar-a-producción)

---

## 1. Crear cuenta en Stripe

### Paso 1: Registro
1. Ve a [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Ingresa tu email y crea una contraseña
3. Verifica tu email

### Paso 2: Completar el perfil
1. Una vez dentro del dashboard, completa la información de tu negocio
2. Para pruebas, puedes usar el **modo test** sin necesidad de verificar tu negocio

> ⚠️ **Importante**: Stripe está disponible en muchos países. Verifica que tu país esté soportado en [stripe.com/global](https://stripe.com/global)

---

## 2. Obtener las API Keys

### Paso 1: Acceder a las claves API
1. Ve a tu [Dashboard de Stripe](https://dashboard.stripe.com)
2. Asegúrate de estar en **modo Test** (toggle en la parte superior derecha)
3. Navega a **Developers** → **API keys**

### Paso 2: Copiar las claves

Verás dos tipos de claves:

| Tipo | Prefijo | Uso |
|------|---------|-----|
| **Publishable key** | `pk_test_` | Frontend (segura para exponer) |
| **Secret key** | `sk_test_` | Backend (NUNCA exponer) |

```
📍 URL: https://dashboard.stripe.com/test/apikeys
```

### Claves de Test vs Live

| Modo | Prefijo | Descripción |
|------|---------|-------------|
| Test | `pk_test_`, `sk_test_` | Para desarrollo y pruebas |
| Live | `pk_live_`, `sk_live_` | Para pagos reales |

> 🔴 **NUNCA** publiques tu `Secret Key` en el código frontend o en repositorios públicos

---

## 3. Configurar Webhooks

Los webhooks permiten que Stripe notifique a tu servidor sobre eventos de pago.

### Paso 1: Crear endpoint de webhook

1. Ve a **Developers** → **Webhooks**
2. Click en **Add endpoint**
3. Configura:
   - **Endpoint URL**: `https://tu-dominio.com/api/payments/webhooks/stripe`
   - Para desarrollo local usa [ngrok](https://ngrok.com) o Stripe CLI

### Paso 2: Seleccionar eventos

Selecciona los eventos que quieres escuchar:

#### Eventos recomendados:
- ✅ `checkout.session.completed` - Checkout exitoso
- ✅ `checkout.session.expired` - Checkout expirado
- ✅ `payment_intent.succeeded` - Pago exitoso
- ✅ `payment_intent.payment_failed` - Pago fallido
- ✅ `payment_intent.canceled` - Pago cancelado
- ✅ `charge.refunded` - Reembolso procesado

### Paso 3: Obtener Webhook Secret

Después de crear el endpoint:
1. Click en tu webhook endpoint
2. Click en **Reveal** bajo "Signing secret"
3. Copia el valor que empieza con `whsec_`

```
📍 URL: https://dashboard.stripe.com/test/webhooks
```

---

## 4. Configurar variables de entorno

### Editar el archivo `.env`

```bash
# En: Autonomo2/payment-service/.env

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51ABC...xyz
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...xyz
STRIPE_WEBHOOK_SECRET=whsec_abc123...xyz

# Frontend URL (para redirecciones)
FRONTEND_URL=http://localhost:3000
```

### Instalar dependencias

```bash
cd Autonomo2/payment-service
npm install
```

---

## 5. Probar la integración

### Opción A: Usando Stripe CLI (Recomendado para desarrollo)

1. **Instalar Stripe CLI**:
   ```bash
   # Windows (con Scoop)
   scoop install stripe
   
   # Mac
   brew install stripe/stripe-cli/stripe
   
   # O descarga desde: https://stripe.com/docs/stripe-cli
   ```

2. **Login en Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Reenviar webhooks a tu servidor local**:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhooks/stripe
   ```
   
   Esto te dará un `webhook signing secret` temporal para desarrollo.

4. **En otra terminal, iniciar tu servidor**:
   ```bash
   npm run dev
   ```

### Opción B: Usando ngrok

1. **Instalar ngrok**: [https://ngrok.com/download](https://ngrok.com/download)

2. **Exponer tu servidor local**:
   ```bash
   ngrok http 5000
   ```

3. **Configurar el webhook en Stripe** con la URL de ngrok:
   ```
   https://abc123.ngrok.io/api/payments/webhooks/stripe
   ```

### Probar un pago

```bash
# Crear una sesión de checkout
curl -X POST http://localhost:5000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "currency": "usd",
    "description": "Producto de prueba",
    "orderId": "order-test-001",
    "customer": {
      "id": "cust-001",
      "name": "Usuario Test",
      "email": "test@example.com"
    },
    "provider": "stripe"
  }'
```

### Tarjetas de prueba

| Número | Descripción |
|--------|-------------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 9995` | Pago rechazado (fondos insuficientes) |
| `4000 0000 0000 0002` | Tarjeta rechazada |
| `4000 0025 0000 3155` | Requiere autenticación 3D Secure |

> Usa cualquier fecha de expiración futura y cualquier CVC de 3 dígitos

---

## 6. Pasar a producción

### Checklist antes de ir a producción

- [ ] Completar verificación de cuenta en Stripe
- [ ] Cambiar claves de test por claves live
- [ ] Actualizar URL de webhook a tu dominio de producción
- [ ] Configurar HTTPS obligatorio
- [ ] Probar flujo completo con una tarjeta real (puedes reembolsar después)
- [ ] Configurar notificaciones de errores

### Cambiar a claves de producción

```bash
# .env (producción)
STRIPE_SECRET_KEY=sk_live_51ABC...xyz
STRIPE_PUBLISHABLE_KEY=pk_live_51ABC...xyz
STRIPE_WEBHOOK_SECRET=whsec_live_abc123...xyz
```

---

## 📡 Endpoints de la API

### Crear pago (Checkout Session)
```
POST /api/payments/create
```

**Body:**
```json
{
  "amount": 2000,
  "currency": "usd",
  "description": "Mi producto",
  "orderId": "order-123",
  "customer": {
    "id": "user-123",
    "name": "Juan Pérez",
    "email": "juan@email.com"
  },
  "provider": "stripe"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "paymentId": "cs_test_...",
  "redirectUrl": "https://checkout.stripe.com/...",
  "status": "pending"
}
```

### Crear PaymentIntent (para Stripe Elements)
```
POST /api/payments/create-intent
```

**Respuesta:**
```json
{
  "success": true,
  "paymentId": "pi_...",
  "clientSecret": "pi_..._secret_...",
  "status": "pending"
}
```

### Consultar estado de pago
```
GET /api/payments/:paymentId/status?provider=stripe
```

### Crear reembolso
```
POST /api/payments/refund
```

**Body:**
```json
{
  "paymentIntentId": "pi_...",
  "amount": 1000
}
```

### Webhook de Stripe
```
POST /api/payments/webhooks/stripe
```
> Este endpoint es llamado automáticamente por Stripe

---

## 🔧 Solución de problemas

### Error: "No signatures found matching the expected signature"

**Causa**: El webhook secret no coincide o el body fue modificado.

**Solución**:
1. Verifica que `STRIPE_WEBHOOK_SECRET` sea correcto
2. Asegúrate de usar el rawBody para verificar la firma
3. Si usas Stripe CLI, usa el secret que te da al ejecutar `stripe listen`

### Error: "STRIPE_SECRET_KEY no está configurada"

**Solución**: Verifica que el archivo `.env` tenga la variable configurada y que el servicio se reinició después de modificarla.

### El webhook no llega a mi servidor local

**Solución**:
1. Usa Stripe CLI: `stripe listen --forward-to localhost:5000/api/payments/webhooks/stripe`
2. O usa ngrok para exponer tu servidor local

---

## 📚 Recursos adicionales

- [Documentación oficial de Stripe](https://stripe.com/docs)
- [API Reference](https://stripe.com/docs/api)
- [Stripe.js & Elements](https://stripe.com/docs/js)
- [Testing](https://stripe.com/docs/testing)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

## 💡 Tips

1. **Siempre verifica los webhooks** con la firma antes de procesarlos
2. **Guarda los IDs de Stripe** en tu base de datos para referencias futuras
3. **Usa idempotency keys** para evitar cargos duplicados
4. **Implementa manejo de errores** robusto en el frontend
5. **Configura alertas** en el dashboard de Stripe para monitorear problemas
