# 📱 Integración con Telegram Bot

Guía paso a paso para crear un bot de Telegram que se conecte con el AI Orchestrator.

## 🚀 Opción 1: Bot de Telegram Nativo (Node.js)

### 1. Crear Bot en Telegram

1. Abre Telegram y busca **@BotFather**
2. Envía el comando `/newbot`
3. Sigue las instrucciones:
   - Nombre del bot: `Mi Marketplace Assistant`
   - Username: `mi_marketplace_bot` (debe terminar en `_bot`)
4. **Guarda el token** que te proporciona BotFather

### 2. Instalar dependencias

```bash
cd Autonomo2/ai-orchestrator
npm install node-telegram-bot-api @types/node-telegram-bot-api
```

### 3. Crear archivo de configuración

Agregar al `.env`:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=tu-token-aqui
TELEGRAM_BOT_ENABLED=true
```

### 4. Crear el bot (archivo telegram-bot.ts)

```typescript
import TelegramBot from 'node-telegram-bot-api';
import { orchestratorService } from './services';
import { MessageType } from './types';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN no configurado');
  process.exit(1);
}

// Crear bot
const bot = new TelegramBot(token, { polling: true });

console.log('✅ Telegram Bot iniciado');

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    '¡Hola! 👋 Soy tu asistente de IA para el marketplace.\n\n' +
    'Puedo ayudarte a:\n' +
    '• Buscar productos\n' +
    '• Consultar órdenes\n' +
    '• Crear compras\n' +
    '• Procesar pagos\n' +
    '• Generar reportes de ventas\n\n' +
    '¿En qué puedo ayudarte?'
  );
});

// Manejar mensajes de texto
bot.on('message', async (msg) => {
  if (msg.text?.startsWith('/')) return; // Ignorar comandos

  const chatId = msg.chat.id;
  const userId = msg.from?.id.toString();
  const userName = msg.from?.first_name;

  try {
    // Indicar que está escribiendo
    await bot.sendChatAction(chatId, 'typing');

    // Procesar con orchestrator
    const response = await orchestratorService.processMessage({
      conversationId: `telegram-${chatId}`,
      message: msg.text || '',
      messageType: MessageType.TEXT,
      userId,
      metadata: {
        source: 'telegram',
        userName,
      },
    });

    // Enviar respuesta
    let messageText = response.assistantResponse;
    
    if (response.toolsUsed && response.toolsUsed.length > 0) {
      messageText += `\n\n🔧 Herramientas usadas: ${response.toolsUsed.join(', ')}`;
    }

    await bot.sendMessage(chatId, messageText);
  } catch (error) {
    console.error('Error procesando mensaje de Telegram:', error);
    await bot.sendMessage(
      chatId,
      'Lo siento, ocurrió un error procesando tu mensaje. Por favor intenta nuevamente.'
    );
  }
});

// Manejar fotos (multimodal)
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    await bot.sendChatAction(chatId, 'typing');
    
    // Obtener la foto de mayor resolución
    const photo = msg.photo![msg.photo!.length - 1];
    const fileId = photo.file_id;
    
    // Descargar foto
    const file = await bot.getFile(fileId);
    const filePath = file.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
    
    // TODO: Descargar y procesar con orchestrator.processImage()
    
    await bot.sendMessage(
      chatId,
      '🖼️ Imagen recibida. El procesamiento de imágenes estará disponible pronto.'
    );
  } catch (error) {
    console.error('Error procesando imagen:', error);
    await bot.sendMessage(chatId, 'Error procesando la imagen.');
  }
});

export default bot;
```

### 5. Iniciar el bot

Agregar al final de `src/index.ts`:

```typescript
// Iniciar Telegram Bot si está habilitado
if (process.env.TELEGRAM_BOT_ENABLED === 'true') {
  import('./telegram-bot');
  console.log('📱 Telegram Bot habilitado');
}
```

---

## 🎨 Opción 2: Integración con n8n (No-Code)

### 1. Instalar n8n

```bash
npm install -g n8n
# O usar Docker
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### 2. Configurar Workflow en n8n

1. Abre n8n: `http://localhost:5678`
2. Crea nuevo workflow
3. Agrega los siguientes nodos:

#### Nodo 1: Telegram Trigger
- **Node**: `Telegram Trigger`
- **Configuration**:
  - Access Token: `tu-telegram-bot-token`
  - Updates: `Message`

#### Nodo 2: HTTP Request
- **Node**: `HTTP Request`
- **Configuration**:
  - Method: `POST`
  - URL: `http://localhost:6000/api/chat/message`
  - Body:
    ```json
    {
      "conversationId": "telegram-{{ $json.message.chat.id }}",
      "message": "{{ $json.message.text }}",
      "messageType": "text",
      "userId": "{{ $json.message.from.id }}"
    }
    ```

#### Nodo 3: Telegram Send Message
- **Node**: `Telegram`
- **Configuration**:
  - Operation: `Send Message`
  - Chat ID: `{{ $json.message.chat.id }}`
  - Text: `{{ $node["HTTP Request"].json.response }}`

3. **Activar el workflow**
4. Listo! El bot responderá automáticamente

---

## 🔗 Opción 3: WhatsApp via n8n + Twilio

### 1. Crear cuenta en Twilio

1. Ve a [https://www.twilio.com](https://www.twilio.com)
2. Crea una cuenta y obtén un número de WhatsApp
3. Configura el sandbox de WhatsApp

### 2. Configurar Webhook en Twilio

- **URL del Webhook**: `http://tu-servidor.com:5678/webhook/whatsapp`
- **Method**: `POST`

### 3. Workflow en n8n

Similar al de Telegram pero usando:
- **Webhook Trigger** en lugar de Telegram Trigger
- **Twilio Node** para enviar respuestas

---

## 📊 Comparación de Opciones

| Característica | Telegram Nativo | Telegram + n8n | WhatsApp + n8n |
|----------------|----------------|----------------|----------------|
| Dificultad | Media | Baja | Media |
| Código necesario | Sí | No | No |
| Multimodal | Sí | Limitado | Limitado |
| Costo | Gratis | Gratis | Twilio (pago) |
| Flexibilidad | Alta | Media | Media |
| Mantenimiento | Manual | Visual | Visual |

---

## 🎯 Recomendación

- **Para desarrollo**: Telegram Nativo (más control)
- **Para prototipo rápido**: n8n con Telegram
- **Para producción**: Depende de tu audiencia (Telegram vs WhatsApp)

---

## 🔐 Seguridad

Recuerda agregar validación de usuarios si es necesario:

```typescript
// Validar usuario autorizado
const AUTHORIZED_USERS = process.env.TELEGRAM_AUTHORIZED_USERS?.split(',') || [];

if (!AUTHORIZED_USERS.includes(userId)) {
  await bot.sendMessage(chatId, 'No tienes acceso a este bot.');
  return;
}
```

---

## 🚀 Siguiente Paso

1. Elige la opción que prefieras
2. Sigue los pasos de configuración
3. Prueba tu bot
4. ¡Disfruta de tu asistente de IA!
