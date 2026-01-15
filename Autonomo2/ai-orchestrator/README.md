# 🤖 AI Orchestrator - Microservicio de Orquestación de IA

Microservicio que orquesta las interacciones con modelos de lenguaje (LLM) para crear un asistente conversacional multimodal con herramientas MCP (Model Context Protocol).

## 📋 Características

- ✅ **Orquestación de IA**: Coordina la interacción con múltiples proveedores de LLM
- ✅ **Multimodal**: Procesa texto, imágenes, PDFs y audio
- ✅ **MCP Tools**: Ejecuta acciones de negocio mediante herramientas
- ✅ **Gestión de Contexto**: Mantiene el historial de conversación en Redis
- ✅ **WebSocket**: Chat en tiempo real con Socket.io
- ✅ **Patrón Strategy**: Intercambio dinámico de proveedores LLM
- ✅ **RESTful API**: Endpoints HTTP para integración

## 🏗️ Arquitectura

```
ai-orchestrator/
├── src/
│   ├── adapters/          # LLM Adapters (Gemini, OpenAI, Claude)
│   ├── tools/             # MCP Tools (consultas, acciones, reportes)
│   ├── services/          # Lógica de negocio
│   │   └── orchestrator.service.ts
│   ├── controllers/       # Controladores HTTP
│   ├── routes/            # Definición de rutas
│   ├── config/            # Configuración (Redis)
│   ├── types/             # Interfaces y tipos
│   └── index.ts           # Punto de entrada
├── .env                   # Variables de entorno
├── package.json
└── tsconfig.json
```

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd Autonomo2/ai-orchestrator
npm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y configurar:

```env
PORT=6000
DEFAULT_LLM_PROVIDER=gemini
GEMINI_API_KEY=tu-api-key-aqui
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📡 Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/chat/message` | Enviar mensaje al chatbot |
| GET | `/api/chat/history/:id` | Obtener historial de conversación |
| POST | `/api/chat/conversation` | Crear nueva conversación |
| DELETE | `/api/chat/conversation/:id` | Eliminar conversación |
| GET | `/api/tools` | Listar herramientas MCP disponibles |
| POST | `/api/tools/execute` | Ejecutar herramienta (testing) |
| GET | `/health` | Estado del servicio |

## 🔌 WebSocket

### Conectar al chat en tiempo real

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:6000');

// Enviar mensaje
socket.emit('chat:message', {
  conversationId: 'uuid',
  message: 'Hola, muéstrame productos',
});

// Recibir respuesta
socket.on('chat:response', (data) => {
  console.log(data);
});
```

## 🛠️ MCP Tools (5 herramientas)

### Herramientas de Consulta (2)
1. **buscar_productos**: Busca productos en el marketplace
2. **consultar_orden**: Consulta el estado de una orden

### Herramientas de Acción (2)
3. **crear_orden**: Crea una nueva orden de compra
4. **procesar_pago**: Procesa un pago para una orden

### Herramientas de Reporte (1)
5. **resumen_ventas**: Genera un resumen de ventas

## 🧠 LLM Providers Soportados

- **Google Gemini** (por defecto, gratis)
- **OpenAI GPT-4** (requiere API key de pago)
- **Claude** (próximamente)

## 📝 Ejemplo de Uso

### Enviar mensaje de texto

```bash
curl -X POST http://localhost:6000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "uuid-123",
    "message": "Muéstrame los productos disponibles",
    "messageType": "text"
  }'
```

### Listar herramientas

```bash
curl http://localhost:6000/api/tools
```

## 🔄 Flujo de Trabajo

1. **Usuario envía mensaje** → Chat Controller
2. **Orchestrator recibe** → Obtiene contexto desde Redis
3. **LLM Adapter procesa** → Gemini/OpenAI genera respuesta
4. **Detecta tool call** → Ejecuta herramienta MCP
5. **Obtiene resultado** → Formatea respuesta
6. **Guarda contexto** → Redis
7. **Responde al usuario** → WebSocket/HTTP

## 🔐 Seguridad

- Integración con Auth Service para validar usuarios
- Rate limiting (próximamente)
- Validación de inputs
- Sanitización de respuestas

## 📦 Dependencias Principales

- `express` - Framework HTTP
- `socket.io` - WebSocket para tiempo real
- `@google/generative-ai` - Google Gemini
- `openai` - OpenAI GPT
- `redis` - Cache de contexto
- `pdf-parse` - Procesamiento de PDFs

## 🎯 Estado Actual

- ✅ Estructura base creada
- ✅ Configuración de servidor
- ✅ Redis para contexto
- ✅ Endpoints básicos
- ✅ WebSocket habilitado
- ⏳ LLM Adapters (siguiente paso)
- ⏳ MCP Tools (siguiente paso)
- ⏳ Procesamiento multimodal

## 📞 Contacto

Puerto: `6000`
WebSocket: `ws://localhost:6000`
