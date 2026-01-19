# N8N Workflows - Configuración Actualizada

## 🚀 ESTADO: TODOS LOS WORKFLOWS LISTOS

### URLs de Microservicios
```
- Payment Service: http://localhost:5000
- Auth Service: http://localhost:4000
- AI Orchestrator: http://localhost:6000
- WebSocket Server: ws://localhost:8000
```

### 1. Payment Handler ✅
**Flujo**: Webhook → Validar → Activar Reserva → Notificar WebSocket → Email → Webhook Partner

**Endpoints configurados**:
- Webhook: `http://localhost:5678/webhook/payment-webhook`
- Activar Reserva: `http://localhost:5000/api/payments`
- Notificar WebSocket: `http://localhost:8000/notify`
- Webhook Partner: Configurable por partner

**Qué hace**:
1. Recibe webhook de pasarela de pago (MercadoPago, Stripe, etc.)
2. Valida que el pago sea exitoso
3. Activa el servicio/reserva en Payment Service
4. Notifica via WebSocket a clientes conectados
5. Envía email de confirmación al usuario
6. Dispara webhook al grupo partner

### 2. Partner Handler ✅
**Flujo**: Webhook → Verificar HMAC → Procesar Evento → Ejecutar Acción → Responder ACK

**Endpoints configurados**:
- Webhook: `http://localhost:5678/webhook/partner-webhook`
- Validación HMAC: Función JavaScript con crypto
- Procesar evento: `http://localhost:5000/api/partners/process`

**Qué hace**:
1. Recibe webhook de grupo partner
2. Verifica firma HMAC para seguridad
3. Procesa según tipo de evento (payment, refund, cancel)
4. Ejecuta acción de negocio correspondiente
5. Responde ACK inmediato

### 3. MCP Input Handler ✅
**Flujo**: Telegram/Email → Extraer Contenido → AI Orchestrator → Responder

**Endpoints configurados**:
- Webhook Telegram: `http://localhost:5678/webhook/telegram`
- AI Orchestrator: `http://localhost:6000/api/chat/message`
- Respuesta Telegram: API de Telegram

**Qué hace**:
1. Recibe mensaje de Telegram o Email
2. Extrae contenido y adjuntos
3. Envía a AI Orchestrator para procesamiento
4. Recibe respuesta inteligente
5. Responde por el mismo canal

### 4. Scheduled Tasks ✅
**Flujo**: Cron → Ejecutar Tarea → Notificar Resultado

**Tareas programadas**:
1. **Reporte Diario** (9:00 AM): Genera reporte de ventas
2. **Limpieza de Datos** (2:00 AM): Limpia logs antiguos y sesiones expiradas
3. **Recordatorios** (10:00 AM): Envía recordatorios de pagos pendientes
4. **Health Checks** (Cada hora): Verifica estado de microservicios

**Endpoints usados**:
- Reporte: `http://localhost:6000/api/tools/execute` (resumen_ventas)
- Limpieza: `http://localhost:4000/auth/cleanup`
- Health: Todos los `/health` endpoints

## 📝 Cómo Importar los Workflows

1. Acceder a n8n: http://localhost:5678
2. Login: admin / admin123
3. Ir a Workflows → Import from File
4. Seleccionar cada archivo JSON
5. Activar cada workflow

## 🔧 Próximos Pasos

1. ✅ n8n corriendo en puerto 5678
2. ⏳ Importar workflows actualizados
3. ⏳ Configurar credenciales (Email, Telegram)
4. ⏳ Activar workflows
5. ⏳ Probar cada flujo

## 🎯 Cumplimiento del Pilar 4

✅ **Todo evento externo pasa por n8n**  
✅ **Payment Handler** - Completo  
✅ **Partner Handler** - Completo  
✅ **MCP Input Handler** - Completo  
✅ **Scheduled Tasks** - Completo  

**Principio fundamental cumplido**: "Todo evento externo pasa por n8n"
