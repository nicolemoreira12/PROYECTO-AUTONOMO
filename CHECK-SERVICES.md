# 🚀 Guía para Iniciar Servicios del Marketplace

## 📦 Servicios Disponibles

### Opción 1: Iniciar TODOS los servicios (Recomendado)
```powershell
.\start-all-services.ps1
```

Esto iniciará:
- ✅ Backend Principal (Puerto 3000) - API REST principal
- ✅ Auth Service (Puerto 4000) - Autenticación JWT
- ✅ Payment Service (Puerto 5000) - Procesamiento de pagos
- ✅ AI Orchestrator (Puerto 6000) - Asistente IA
- ✅ WebSocket Service (Puerto 8000) - Tiempo real
- ✅ Frontend (Puerto 5173) - Interfaz React

### Opción 2: Solo servicios backend esenciales
```powershell
.\start-backend-only.ps1
```

Esto iniciará:
- ✅ Backend Principal (Puerto 3000)
- ✅ Auth Service (Puerto 4000)
- ✅ Payment Service (Puerto 5000)

Después inicia el frontend manualmente:
```powershell
cd marketplace-frontend
npm run dev
```

## 🔍 Verificar si los servicios están corriendo

### Verificar puertos ocupados:
```powershell
# Ver todos los puertos del marketplace
netstat -ano | findstr "3000 4000 5000 6000 8000 5173"
```

### Verificar servicios específicos:
```powershell
# Backend Principal
curl http://localhost:3000/api/productos

# Auth Service
curl http://localhost:4000/health

# Frontend
curl http://localhost:5173
```

## ❌ Detener servicios

### Opción 1: Cerrar ventanas individuales
Cierra las ventanas de PowerShell que se abrieron para cada servicio

### Opción 2: Matar procesos por puerto
```powershell
# Detener Backend (puerto 3000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Detener Auth (puerto 4000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force

# Detener Payment (puerto 5000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Detener AI (puerto 6000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 6000).OwningProcess | Stop-Process -Force

# Detener WebSocket (puerto 8000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force

# Detener Frontend (puerto 5173)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### Opción 3: Script para detener todos
```powershell
$ports = @(3000, 4000, 5000, 6000, 8000, 5173)
foreach ($port in $ports) {
    try {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $process.OwningProcess -Force
            Write-Host "✅ Detenido servicio en puerto $port" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  No hay servicio en puerto $port" -ForegroundColor Yellow
    }
}
```

## 📝 Requisitos previos

### Antes de iniciar los servicios:

1. **Node.js y npm** instalados
2. **Python** instalado (para WebSocket service)
3. **PostgreSQL/Supabase** configurado
4. **Variables de entorno** configuradas en cada servicio

### Verificar instalación de dependencias:

```powershell
# Backend Principal
cd Markplace
npm install

# Auth Service
cd ..\Autonomo2\auth-service
npm install

# Payment Service
cd ..\payment-service
npm install

# AI Orchestrator
cd ..\ai-orchestrator
npm install

# Frontend
cd ..\..\marketplace-frontend
npm install

# WebSocket (Python)
cd ..\websoker
pip install -r requirements.txt
```

## 🔧 Configuración de variables de entorno

### Backend Principal (.env en Markplace/)
```env
PORT=3000
DB_HOST=your-supabase-host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=postgres
```

### Auth Service (.env en Autonomo2/auth-service/)
```env
PORT=4000
DATABASE_URL=your-database-url
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

### Payment Service (.env en Autonomo2/payment-service/)
```env
PORT=5000
DATABASE_URL=your-database-url
```

### Frontend (.env en marketplace-frontend/)
```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH_URL=http://localhost:4000
VITE_PAYMENT_URL=http://localhost:5000
VITE_AI_ORCHESTRATOR_URL=http://localhost:6000
VITE_WEBSOCKET_URL=ws://127.0.0.1:8000
```

## 🐛 Solución de problemas

### Error: "Puerto ya en uso"
```powershell
# Encuentra y mata el proceso
netstat -ano | findstr :[PUERTO]
taskkill /PID [PID] /F
```

### Error: "npm no encontrado"
Instala Node.js desde https://nodejs.org/

### Error: "python no encontrado"
Instala Python desde https://www.python.org/

### Error: "No se puede conectar a la base de datos"
Verifica:
1. Supabase está activo
2. Las credenciales en .env son correctas
3. El firewall no bloquea la conexión

### Error: "EADDRINUSE" (dirección ya en uso)
```powershell
# Liberar puerto específico
Get-Process -Id (Get-NetTCPConnection -LocalPort [PUERTO]).OwningProcess | Stop-Process -Force
```

## 📊 URLs de acceso

Una vez todos los servicios estén corriendo:

- **Marketplace (Frontend)**: http://localhost:5173
- **API Backend**: http://localhost:3000/api
- **GraphQL Playground**: http://localhost:3000/graphql
- **Auth API**: http://localhost:4000
- **Payment API**: http://localhost:5000
- **AI API**: http://localhost:6000

## 🎯 Orden recomendado de inicio

1. **Backend Principal** (3000) - Primero, es el core
2. **Auth Service** (4000) - Segundo, para login/register
3. **Payment Service** (5000) - Tercero, para pagos
4. **AI Orchestrator** (6000) - Opcional
5. **WebSocket** (8000) - Opcional
6. **Frontend** (5173) - Último, necesita los backends

## ✅ Checklist de verificación

- [ ] Todas las dependencias instaladas (npm install en cada servicio)
- [ ] Archivos .env configurados en cada servicio
- [ ] PostgreSQL/Supabase accesible
- [ ] Puertos 3000, 4000, 5000, 5173 libres
- [ ] Backend principal corre sin errores
- [ ] Auth service responde
- [ ] Frontend muestra la interfaz

## 💡 Consejos

1. **Usa el script automático** (`start-all-services.ps1`) para facilitar el inicio
2. **Revisa los logs** en cada ventana para detectar errores
3. **Inicia servicios gradualmente** si tienes problemas
4. **Verifica la conexión a BD** antes de iniciar todo
5. **Mantén las ventanas abiertas** para ver logs en tiempo real
