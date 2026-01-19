# ✅ N8N WORKFLOWS - CONFIGURACIÓN FINAL

## 📊 Estado de los Workflows

### 1. Payment Handler (Manejador de pago) ✅
- **Estado**: ACTIVO
- **URL Webhook**: `http://localhost:5678/webhook-test/payment/webhook`
- **Método**: POST
- **Body ejemplo**:
```json
{
  "orderId": "order-123",
  "amount": 150.00,
  "currency": "USD",
  "status": "completed"
}
```

### 2. Partner Handler (Manejador de socios) ✅
- **Estado**: ACTIVO
- **URL Webhook**: `http://localhost:5678/webhook-test/partner/webhook`
- **Método**: POST
- **Body ejemplo**:
```json
{
  "partnerId": "partner-456",
  "action": "sync",
  "data": {
    "products": 10,
    "revenue": 5000
  }
}
```

### 3. MCP Input Handler (Simplificado) ✅
- **Estado**: ACTIVO
- **URL Webhook**: `http://localhost:5678/webhook-test/mcp-input`
- **Método**: POST
- **Body ejemplo**:
```json
{
  "message": "¿Puedes mostrarme los productos disponibles?",
  "userId": "user-789"
}
```
- **Funcionalidad**: Recibe mensajes y los envía al AI Orchestrator (puerto 6000)

### 4. Scheduled Tasks (Tareas Programadas) ✅
- **Estado**: ACTIVO
- **Tipo**: Cron Jobs (automático)
- **No requiere webhook** - Se ejecuta según horarios configurados

---

## 🧪 Comandos de Prueba PowerShell

```powershell
# Test Payment Handler
$payment = @{
    orderId = "test-123"
    amount = 100.50
    currency = "USD"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook-test/payment/webhook" `
    -Method POST -Body $payment -ContentType "application/json"

# Test Partner Handler
$partner = @{
    partnerId = "partner-123"
    action = "sync"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook-test/partner/webhook" `
    -Method POST -Body $partner -ContentType "application/json"

# Test MCP Input Handler
$mcp = @{
    message = "Hola, ¿cómo estás?"
    userId = "test-user"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook-test/mcp-input" `
    -Method POST -Body $mcp -ContentType "application/json"
```

---

## 📝 Notas Importantes

1. **Modo Producción**: Todos los workflows están en modo producción (`/webhook-test/`)
2. **Webhooks HTTP**: Configurados para aceptar HTTP (no requieren HTTPS en desarrollo)
3. **Nodos eliminados**: 
   - Email (requería SMTP)
   - Telegram (requería HTTPS)
4. **Integración AI**: El MCP Input Handler se conecta con AI Orchestrator en `http://localhost:6000/api/chat/message`

---

## 🔗 URLs de Microservicios Conectados

- Auth Service: `http://localhost:4000`
- Payment Service: `http://localhost:5000`
- AI Orchestrator: `http://localhost:6000`
- WebSocket Server: `http://localhost:8000`
- n8n Event Bus: `http://localhost:5678`

---

**Fecha de configuración**: 19 de enero de 2026
**Total de workflows activos**: 4/4 ✅
