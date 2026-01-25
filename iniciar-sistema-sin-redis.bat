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
echo [1/5] Iniciando Backend Principal (Marketplace)...
start "Marketplace Backend - Puerto 3000" cmd /k "cd /d %~dp0Markplace && npm run dev"
timeout /t 3 /nobreak > nul

echo [2/5] Iniciando Servicio de Autenticación...
start "Auth Service - Puerto 4000" cmd /k "cd /d %~dp0Autonomo2\auth-service && npm run dev"
timeout /t 3 /nobreak > nul

echo [3/5] Iniciando Servidor WebSocket...
start "WebSocket Server - Puerto 8000" cmd /k "cd /d %~dp0websoker && python run.py"
timeout /t 3 /nobreak > nul

echo [4/5] Iniciando Sistema de IA (AI Orchestrator)...
start "AI Orchestrator - Puerto 3002" cmd /k "cd /d %~dp0Autonomo2\ai-orchestrator && npm run dev"
timeout /t 3 /nobreak > nul

echo [5/5] Iniciando Frontend...
start "Frontend - Puerto 5173" cmd /k "cd /d %~dp0marketplace-frontend && npm run dev"
timeout /t 2 /nobreak > nul

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║           SISTEMA INICIADO (MODO SIN REDIS)                   ║
echo ╠═══════════════════════════════════════════════════════════════╣
echo ║  ℹ Redis:                  No disponible (usando fallback)    ║
echo ║  ✓ Backend Principal:      http://localhost:3000              ║
echo ║  ✓ Auth Service:           http://localhost:4000              ║
echo ║  ✓ WebSocket Server:       ws://localhost:8000                ║
echo ║  ✓ AI Orchestrator:        http://localhost:3002              ║
echo ║  ✓ Frontend:               http://localhost:5173              ║
echo ╠═══════════════════════════════════════════════════════════════╣
echo ║  El sistema funciona normalmente sin Redis                    ║
echo ║  Solo verás advertencias en los logs, no afecta el sistema    ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
pause
