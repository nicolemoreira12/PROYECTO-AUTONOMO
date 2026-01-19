# 📘 Guía Completa de Workflows n8n - Pilar 4

## 🎯 Principio Fundamental
**"Todo evento externo pasa por n8n"**

---

## 🚀 Inicio Rápido

### Levantar n8n
```powershell
cd "c:\Users\Usuario\OneDrive\Documentos\PROYECTO-AUTONOMO\Autonomo2\n8n"
docker-compose up -d
```

### Acceder a n8n
- **URL**: http://localhost:5678
- **Dashboard**: Workflows visibles en la interfaz

### Levantar Servicios Backend
```powershell
# Terminal 1 - Payment Service
cd "c:\Users\Usuario\OneDrive\Documentos\PROYECTO-AUTONOMO\Autonomo2\payment-service"
npm run dev

# Terminal 2 - Auth Service
cd "c:\Users\Usuario\OneDrive\Documentos\PROYECTO-AUTONOMO\Autonomo2\auth-service"
npm run dev

# Terminal 3 - AI Orchestrator
cd "c:\Users\Usuario\OneDrive\Documentos\PROYECTO-AUTONOMO\Autonomo2\ai-orchestrator"
npm run dev
```

---

## 📋 Workflows Obligatorios

### 1️⃣ Payment Handler ✅

**Archivo**: `payment-handler-workflow.json`

**URL del Webhook**:
```
http://localhost:5678/webhook/payment/webhook
```

**Flujo**:
1. Recibe webhook de pasarela de pago
2. Valida que el pago sea exitoso
3. Activa servicio/reserva
4. Notifica via WebSocket
5. Envía email de confirmación
6. Dispara webhook al grupo partner

**Ejemplo de Payload**:
```json
{
  "status": "success",
  "email": "cliente@example.com",
  "orderId": "ORD-12345",
  "amount": 150.00,
  "currency": "USD",
  "paymentMethod": "credit_card",
  "timestamp": "2026-01-19T15:30:00Z"
}
```

**Probar con PowerShell**:
```powershell
Invoke-WebRequest -Uri "http://localhost:5678/webhook/payment/webhook" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"status":"success","email":"test@example.com","orderId":"TEST001","amount":100}' `
  -UseBasicParsing
```

**Respuesta Esperada**:
```json
{"message":"Workflow was started"}
```

---

### 2️⃣ Partner Handler ✅

**Archivo**: `partner-handler-workflow.json`

**URL del Webhook**:
```
http://localhost:5678/webhook/partner/webhook
```

**Flujo**:
1. Recibe webhook de grupo partner
2. Verifica firma HMAC para seguridad
3. Procesa según tipo de evento (eventoA/eventoB)
4. Ejecuta acción de negocio correspondiente
5. Responde ACK inmediato

**Ejemplo de Payload - EventoA**:
```json
{
  "eventType": "eventoA",
  "data": {
    "partnerId": "partner-123",
    "action": "sync",
    "timestamp": "2026-01-19T15:30:00Z"
  },
  "signature": "hmac_signature_here"
}
```

**Ejemplo de Payload - EventoB**:
```json
{
  "eventType": "eventoB",
  "data": {
    "partnerId": "partner-456",
    "action": "notification",
    "message": "Nuevo pedido disponible"
  },
  "signature": "hmac_signature_here"
}
```

**Probar con PowerShell**:
```powershell
Invoke-WebRequest -Uri "http://localhost:5678/webhook/partner/webhook" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"eventType":"eventoA","data":"test partner","signature":"test123"}' `
  -UseBasicParsing
```

**Respuesta Esperada**:
```json
{"message":"Workflow was started"}
```

---

### 3️⃣ MCP Input Handler ✅

**Archivo**: `mcp-input-handler-simplified.json`

**URL del Webhook**:
```
http://localhost:5678/webhook/mcp-input
```

**Flujo**:
1. Recibe mensaje de Telegram/Email/Chat
2. Extrae contenido y metadatos
3. Envía a AI Orchestrator (puerto 6000)
4. Responde por el mismo canal

**Ejemplo de Payload**:
```json
{
  "message": "¿Cuáles son los productos disponibles?",
  "userId": "user-123",
  "channel": "telegram",
  "chatId": "chat-456"
}
```

**Probar con PowerShell**:
```powershell
Invoke-WebRequest -Uri "http://localhost:5678/webhook/mcp-input" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"message":"Hola desde test","userId":"user123"}' `
  -UseBasicParsing
```

**Respuesta Esperada**:
```
StatusCode: 200 (respuesta vacía pero exitosa)
```

---

### 4️⃣ Scheduled Tasks ✅

**Archivo**: `scheduled-tasks-workflow.json`

**Tipo**: Workflow con Cron (NO tiene webhook público)

**Tareas Programadas**:

#### 📊 Reporte Diario (9:00 AM)
- Genera reporte de ventas
- Envía email a admin@tuapp.com

#### 🧹 Limpieza de Datos (2:00 AM)
- Limpia sesiones expiradas
- Elimina logs antiguos (> 30 días)

#### ⏰ Recordatorios de Pagos (10:00 AM)
- Obtiene pagos pendientes
- Envía email recordatorio a cada cliente

#### 💚 Health Checks (Cada Hora)
- Verifica estado de Payment Service
- Verifica estado de Auth Service
- Verifica estado de AI Orchestrator
- Si hay problemas, envía alerta

**Configuración de Cron**:
```javascript
// Reporte Diario
mode: "everyDay"
hour: 9
minute: 0

// Limpieza
mode: "everyDay"
hour: 2
minute: 0

// Recordatorios
mode: "everyDay"
hour: 10
minute: 0

// Health Checks
mode: "everyHour"
```

**⚠️ IMPORTANTE**: Este workflow NO se puede ejecutar manualmente, solo se activa en los horarios programados.

**Versión de Prueba**: `scheduled-tasks-test.json`
- Tiene webhook para probar inmediatamente
- URL: `http://localhost:5678/webhook/scheduled-tasks/test`

```powershell
Invoke-WebRequest -Uri "http://localhost:5678/webhook/scheduled-tasks/test" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{}' `
  -UseBasicParsing
```

---

## 🔄 Activar/Desactivar Workflows

### En la Interfaz de n8n:

1. **Acceder al workflow**:
   - Ir a http://localhost:5678
   - Click en el workflow deseado

2. **Activar**:
   - Toggle superior derecho: `OFF` → `ON`
   - Aparece mensaje: "Workflow activado"
   - URL del webhook se genera automáticamente

3. **Desactivar**:
   - Toggle superior derecho: `ON` → `OFF`
   - Webhook deja de responder
   - Útil para mantenimiento

4. **Estado de Activación**:
   - 🟢 Verde = Activo
   - ⚪ Gris = Inactivo

### Desde PowerShell (Verificar Estado):

```powershell
# Verificar si n8n está corriendo
docker ps | Select-String "n8n"

# Verificar si webhook responde
Invoke-WebRequest -Uri "http://localhost:5678/webhook/payment/webhook" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"test":"ping"}' `
  -UseBasicParsing
```

---

## 📦 Importar Workflows

### Método 1: Desde Archivo

1. Ir a n8n: http://localhost:5678
2. Click en menú "Workflows" (esquina superior izquierda)
3. Click en "Import from File"
4. Seleccionar el archivo JSON del workflow
5. Click en "Save" para guardar
6. Activar el toggle para ponerlo en funcionamiento

### Método 2: Copiar JSON

1. Abrir el archivo JSON del workflow
2. Copiar todo el contenido
3. En n8n, crear nuevo workflow
4. Click en menú (⋮) → "Import from Clipboard"
5. Pegar el JSON
6. Guardar y activar

---

## 🛠️ Servicios y Puertos

| Servicio | Puerto | URL | Health Check |
|----------|--------|-----|--------------|
| n8n | 5678 | http://localhost:5678 | - |
| Payment Service | 5000 | http://localhost:5000 | /health |
| Auth Service | 4000 | http://localhost:4000 | /health |
| AI Orchestrator | 6000 | http://localhost:6000 | /health |

### Verificar Servicios:

```powershell
# Payment Service
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing

# Auth Service
Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing

# AI Orchestrator
Invoke-WebRequest -Uri "http://localhost:6000/health" -UseBasicParsing
```

**Respuesta Esperada**:
```json
{
  "status": "ok",
  "service": "payment-service",
  "timestamp": "2026-01-19T15:43:01.093Z"
}
```

---

## 🔍 Troubleshooting

### Problema: Webhook no responde

**Solución**:
1. Verificar que n8n esté corriendo: `docker ps`
2. Verificar que el workflow esté activo (toggle verde)
3. Revisar logs de n8n: `docker logs n8n-n8n-1`

### Problema: Servicio backend no responde

**Solución**:
1. Verificar que el servicio esté corriendo
2. Revisar logs en la terminal del servicio
3. Verificar puerto correcto en el workflow

### Problema: Error de firma HMAC en Partner Handler

**Solución**:
1. Actualizar `TU_CLAVE_SECRETA` en el nodo "Verificar HMAC"
2. Asegurar que el partner use la misma clave
3. Para pruebas, temporalmente quitar validación HMAC

### Problema: Scheduled Tasks no se ejecuta

**Solución**:
1. Verificar que el workflow esté activo
2. Esperar a la hora programada (NO se puede ejecutar manualmente)
3. Usar `scheduled-tasks-test.json` para pruebas inmediatas

---

## 📊 Monitoreo

### Ver Ejecuciones de Workflows:

1. Ir a http://localhost:5678
2. Click en "Executions" (panel izquierdo)
3. Ver historial de ejecuciones exitosas y fallidas
4. Click en una ejecución para ver detalles

### Logs en Tiempo Real:

```powershell
# Ver logs de n8n
docker logs -f n8n-n8n-1

# Ver logs de Payment Service
# (en la terminal donde se ejecutó npm run dev)

# Ver logs de Auth Service
# (en la terminal donde se ejecutó npm run dev)

# Ver logs de AI Orchestrator
# (en la terminal donde se ejecutó npm run dev)
```

---

## ✅ Checklist de Cumplimiento del Pilar 4

- [x] n8n corriendo en puerto 5678
- [x] Payment Handler implementado y funcionando
- [x] Partner Handler implementado y funcionando
- [x] MCP Input Handler implementado y funcionando
- [x] Scheduled Tasks configurado con 4 tareas
- [x] Servicios backend corriendo (Payment, Auth, AI Orchestrator)
- [x] Webhooks activos y respondiendo
- [x] Principio "Todo evento externo pasa por n8n" cumplido
- [x] Documentación completa creada

---

## 📞 Resumen de URLs

```
n8n Dashboard:
http://localhost:5678

Webhooks:
http://localhost:5678/webhook/payment/webhook
http://localhost:5678/webhook/partner/webhook
http://localhost:5678/webhook/mcp-input
http://localhost:5678/webhook/scheduled-tasks/test (solo versión test)

Servicios Backend:
http://localhost:5000 - Payment Service
http://localhost:4000 - Auth Service
http://localhost:6000 - AI Orchestrator
```

---

**🎉 Pilar 4 - n8n Event Bus: COMPLETO**
