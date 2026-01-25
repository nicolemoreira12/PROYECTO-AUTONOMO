@echo off
chcp 65001 > nul
color 0C
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║         DETENIENDO TODOS LOS SERVICIOS DEL SISTEMA            ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo Deteniendo procesos Node.js (Backend, Auth, AI, Frontend)...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Procesos Node.js detenidos
) else (
    echo ℹ No se encontraron procesos Node.js activos
)

echo.
echo Deteniendo procesos Python (WebSocket Server)...
taskkill /F /IM python.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Procesos Python detenidos
) else (
    echo ℹ No se encontraron procesos Python activos
)

echo.
echo Deteniendo procesos ts-node-dev...
taskkill /F /IM ts-node-dev.exe 2>nul

echo.
echo Deteniendo Redis (Docker)...
docker-compose -f docker-compose.redis.yml down 2>nul
if %errorlevel% equ 0 (
    echo ✓ Redis detenido
) else (
    echo ℹ Redis no estaba corriendo o Docker no disponible
)

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║              TODOS LOS SERVICIOS DETENIDOS                    ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
pause
