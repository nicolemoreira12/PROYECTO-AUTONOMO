#!/usr/bin/env pwsh
# Script para verificar el estado de todos los servicios

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          VERIFICACIÓN DE SERVICIOS - MARKETPLACE          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$services = @(
    @{Name="Auth Service"; Url="http://localhost:4000/health"; Port=4000},
    @{Name="Markplace Backend"; Url="http://localhost:3000/health"; Port=3000},
    @{Name="WebSocket Server"; Url="http://localhost:8000"; Port=8000},
    @{Name="Frontend"; Url="http://localhost:5173"; Port=5173}
)

foreach ($service in $services) {
    Write-Host "⏳ Verificando $($service.Name) (Puerto $($service.Port))..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ Activo" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  Respuesta: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ❌ No disponible" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor DarkGray
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ESTADO DE PUERTOS                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$ports = @(3000, 4000, 5173, 8000)

foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
    
    $status = if ($connection) { "✅ Abierto" } else { "❌ Cerrado" }
    $color = if ($connection) { "Green" } else { "Red" }
    
    Write-Host "Puerto $port : " -NoNewline
    Write-Host $status -ForegroundColor $color
}

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      URLs DE ACCESO                       ║" -ForegroundColor Cyan
Write-Host "╠═══════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  Frontend:        http://localhost:5173                   ║" -ForegroundColor White
Write-Host "║  Backend API:     http://localhost:3000                   ║" -ForegroundColor White
Write-Host "║  GraphQL:         http://localhost:3000/graphql           ║" -ForegroundColor White
Write-Host "║  Auth Service:    http://localhost:4000                   ║" -ForegroundColor White
Write-Host "║  WebSocket:       ws://localhost:8000                     ║" -ForegroundColor White
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
