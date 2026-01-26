@echo off
chcp 65001 > nul
color 0A
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║          INICIANDO SISTEMA (SIN REDIS) - MARKETPLACE          ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo ℹ Este script inicia el sistema sin Redis (modo fallback)
echo.
echo [1/6] Iniciando Backend Principal (Marketplace)...
start "Marketplace Backend - Puerto 3000" cmd /k "cd /d %~dp0Markplace && npm run dev"
timeout /t 3 /nobreak > nul

echo [2/6] Iniciando Servicio de Autenticación...
start "Auth Service - Puerto 4000" cmd /k "cd /d %~dp0Autonomo2\auth-service && npm run dev"
timeout /t 3 /nobreak > nul

echo [3/6] Iniciando Servicio de Pagos (Stripe)...
start "Payment Service - Puerto 5000" cmd /k "cd /d %~dp0Autonomo2\payment-service && npm run dev"
timeout /t 3 /nobreak > nul

echo [4/6] Iniciando Servidor WebSocket...
start "WebSocket Server - Puerto 8000" cmd /k "cd /d %~dp0websoker && python run.py"
timeout /t 3 /nobreak > nul

echo [5/6] Iniciando Sistema de IA (AI Orchestrator)...
start "AI Orchestrator - Puerto 3002" cmd /k "cd /d %~dp0Autonomo2\ai-orchestrator && npm run dev"
timeout /t 3 /nobreak > nul

echo [6/6] Iniciando Frontend...
start "Frontend - Puerto 5173" cmd /k "cd /d %~dp0marketplace-frontend && npm run dev"
timeout /t 2 /nobreak > nul

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║           SISTEMA INICIADO (MODO SIN REDIS)                   ║
echo ╠═══════════════════════════════════════════════════════════════╣
echo ║  ℹ Redis:                  No disponible (usando fallback)    ║
echo ║  ✓ Backend Principal:      http://localhost:3000              ║
echo ║  ✓ Auth Service:           http://localhost:4000              ║
echo ║  ✓ Payment Service:        http://localhost:5000 (Stripe)     ║
echo ║  ✓ WebSocket Server:       ws://localhost:8000                ║
echo ║  ✓ AI Orchestrator:        http://localhost:3002              ║
echo ║  ✓ Frontend:               http://localhost:5173              ║
echo ╠═══════════════════════════════════════════════════════════════╣
echo ║  El sistema funciona normalmente sin Redis                    ║
echo ║  Solo verás advertencias en los logs, no afecta el sistema    ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                     PROBAR STRIPE                             ║
echo ╠═══════════════════════════════════════════════════════════════╣
echo ║  1. Abre: http://localhost:5000/api/payments/health           ║
echo ║  2. Tarjeta de prueba: 4242 4242 4242 4242                    ║
echo ║  3. CVC: cualquier 3 digitos, Fecha: cualquier futura         ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
pause
