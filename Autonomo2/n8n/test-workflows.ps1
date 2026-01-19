# Script para probar los 4 workflows de n8n

Write-Host "`n=== TEST 1: MCP Input Handler ===" -ForegroundColor Cyan
try {
    $mcpData = @{
        message = "Hola desde n8n, ¿puedes listar productos?"
        userId = "test-user"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5678/webhook-test/mcp-input" `
        -Method POST `
        -Body $mcpData `
        -ContentType "application/json"
    Write-Host "✅ MCP Input Handler respondió:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Error en MCP Input Handler: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST 2: Payment Handler ===" -ForegroundColor Cyan
try {
    $paymentData = @{
        orderId = "test-order-123"
        amount = 100.50
        currency = "USD"
        status = "completed"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5678/webhook-test/payment/webhook" `
        -Method POST `
        -Body $paymentData `
        -ContentType "application/json"
    Write-Host "✅ Payment Handler respondió:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Error en Payment Handler: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST 3: Partner Handler ===" -ForegroundColor Cyan
try {
    $partnerData = @{
        partnerId = "partner-123"
        action = "sync"
        data = @{ test = "data" }
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5678/webhook-test/partner/webhook" `
        -Method POST `
        -Body $partnerData `
        -ContentType "application/json"
    Write-Host "✅ Partner Handler respondió:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Error en Partner Handler: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Resumen ===" -ForegroundColor Yellow
Write-Host "Si todos los webhooks respondieron, los workflows están funcionando correctamente."
Write-Host "Scheduled Tasks se ejecutará automáticamente según los horarios configurados en Cron."
