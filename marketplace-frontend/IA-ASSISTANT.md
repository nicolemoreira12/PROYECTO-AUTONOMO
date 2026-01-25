# 🤖 Asistente IA - Documentación

## 📋 Descripción

El **Asistente IA** es un chatbot inteligente integrado en el marketplace que ayuda a los usuarios con:
- 💡 Recomendaciones de productos
- 📦 Información sobre categorías
- 🛒 Proceso de compra
- 💳 Métodos de pago y envío
- ❓ Preguntas generales

## ✅ Modo Offline Implementado

El asistente funciona completamente **sin necesidad del AI Orchestrator** (puerto 6000). Todas las respuestas están basadas en patrones inteligentes y productos de ejemplo.

### Funcionalidades en Modo Offline:

#### 1️⃣ Reconocimiento de Patrones Inteligentes

El asistente reconoce los siguientes tipos de preguntas:

**Saludos:**
- `hola`, `hi`, `hey`, `buenos días`, `buenas tardes`
- Respuesta: Mensaje de bienvenida con opciones sugeridas

**Recomendaciones:**
- `recomiéndame`, `sugerir`, `mejor producto`, `qué comprar`
- Respuesta: 3 productos aleatorios con descripción

**Categorías:**
- `categorías`, `qué vendes`, `tipos de productos`
- Respuesta: Lista de 5 categorías principales

**Precios:**
- `precio`, `cuánto cuesta`, `barato`, `económico`, `ofertas`
- Respuesta: Productos bajo $50

**Compras:**
- `comprar`, `carrito`, `pagar`, `pedido`, `orden`
- Respuesta: Guía paso a paso del proceso de compra

**Envíos:**
- `envío`, `entrega`, `delivery`, `shipping`
- Respuesta: Información de métodos de envío y tiempos

**Ayuda:**
- `ayuda`, `help`, `cómo`, `no entiendo`
- Respuesta: Lista de capacidades del asistente

**Productos específicos:**
- `laptop`, `computadora`, `teléfono`, `celular`, `smartphone`
- Respuesta: Lista de productos que coinciden

**Despedidas:**
- `adiós`, `chao`, `bye`, `hasta luego`
- Respuesta: Mensaje de despedida amigable

**Agradecimientos:**
- `gracias`, `thank you`
- Respuesta: De nada con pregunta de continuación

#### 2️⃣ Sugerencias Rápidas

Cada respuesta del asistente incluye **botones de sugerencia** que el usuario puede hacer clic para continuar la conversación sin escribir.

**Ejemplo:**
```
Usuario: "Hola"
Asistente: "¡Hola! 👋 ¿En qué puedo ayudarte?"
Sugerencias: [Ver productos] [Buscar ofertas] [¿Qué vendes?]
```

#### 3️⃣ Simulación Realista

- **Delay de respuesta**: 800ms (simula tiempo de procesamiento)
- **Indicador de escritura**: Animación de 3 puntos mientras "piensa"
- **Conversación contextual**: Mantiene historial de mensajes

## 🎯 Casos de Uso

### Caso 1: Usuario Nuevo Explorando

```
Usuario: "Hola"
IA: "¡Hola! 👋 Soy tu asistente de compras con IA.

¿En qué puedo ayudarte hoy?

💡 Puedes preguntarme sobre:
• Recomendaciones de productos
• Información sobre categorías
• Ayuda con compras
• Métodos de pago y envío"

[Sugerencias: Ver productos | Buscar ofertas | ¿Qué vendes?]
```

### Caso 2: Búsqueda de Productos

```
Usuario: "Busco una laptop"
IA: "💻 Encontré estas laptops para ti:

• **MacBook Air M2** - $1299
  Potente laptop con chip M2, 8GB RAM...

• **Dell XPS 13** - $999
  Ultra delgada, procesador Intel Core...

• **Lenovo ThinkPad** - $849
  Diseñada para profesionales, i5...

¿Te interesa alguna en particular?"

[Sugerencias: Ver detalles | Comparar | Agregar al carrito]
```

### Caso 3: Consulta de Precios

```
Usuario: "¿Qué productos son baratos?"
IA: "💰 Aquí tienes algunos productos económicos:

• Mouse Inalámbrico - **$19.99**
• Auriculares Bluetooth - **$29.99**
• Funda para Laptop - **$24.99**

Todos nuestros productos tienen precios competitivos. 
¿Te gustaría ver más opciones?"

[Sugerencias: Ver ofertas | Productos bajo $30 | Ver todo]
```

### Caso 4: Ayuda con Compra

```
Usuario: "¿Cómo compro?"
IA: "🛒 Para realizar una compra:

1. Explora nuestros productos
2. Haz clic en 'Agregar al carrito'
3. Ve al carrito (icono arriba derecha)
4. Revisa tu orden
5. Procede al pago

✅ Aceptamos:
• Tarjetas de crédito/débito
• PayPal y wallets digitales
• Criptomonedas
• Transferencias bancarias
• Efectivo contra entrega

¿Necesitas ayuda con algo específico?"

[Sugerencias: Ver carrito | Métodos de pago | Envíos]
```

### Caso 5: Información de Envíos

```
Usuario: "¿Cuánto tarda el envío?"
IA: "📦 Información de envíos:

• **Envío estándar**: 5-7 días hábiles - GRATIS en compras +$50
• **Envío express**: 2-3 días hábiles - $9.99
• **Envío same-day**: Mismo día - $19.99 (ciudades selectas)

🎁 Envío gratis en compras mayores a $50

¿Deseas agregar productos al carrito?"

[Sugerencias: Ver productos | Calcular envío | Políticas]
```

## 🎨 Interfaz de Usuario

### Botón Flotante
- **Ubicación**: Esquina inferior derecha
- **Tamaño**: 60x60px (móvil: 50x50px)
- **Color**: Gradiente púrpura (`#667eea` → `#764ba2`)
- **Icono**: Robot (`fa-robot`)
- **Efecto hover**: Escala 1.1x con sombra

### Panel del Chat
- **Tamaño**: 400x600px (móvil: pantalla completa)
- **Secciones**:
  1. **Header**: Logo + título + botón cerrar
  2. **Mensajes**: Área scrolleable con historial
  3. **Sugerencias**: Botones rápidos (opcional)
  4. **Input**: Campo de texto + botón enviar

### Burbujas de Mensaje
- **Usuario**: Alineado derecha, fondo gradiente púrpura
- **Asistente**: Alineado izquierda, fondo blanco con sombra
- **Timestamp**: Hora en formato local

### Sugerencias Rápidas
- **Estilo**: Botones blancos con borde púrpura
- **Hover**: Fondo púrpura con texto blanco
- **Animación**: Slide down al aparecer

## 🔧 Implementación Técnica

### Estructura de Archivos

```
marketplace-frontend/src/
├── infrastructure/services/
│   └── AIService.ts          # Lógica del asistente (500+ líneas)
├── presentation/components/
│   ├── AIAssistant.tsx        # Componente UI
│   └── AIAssistant.css        # Estilos (290+ líneas)
└── App.tsx                    # Integración global
```

### AIService.ts - Métodos Principales

```typescript
class AIService {
    private offlineMode: boolean;
    private conversationHistory: AIMessage[];
    
    // Iniciar conversación (online o offline)
    async startConversation(): Promise<string | null>
    
    // Enviar mensaje y obtener respuesta
    async sendMessage(message: string): Promise<AIResponse>
    
    // Obtener respuesta offline basada en patrones
    private getOfflineResponse(message: string): AIResponse
    
    // Recomendaciones de productos
    async getProductRecommendations(): Promise<ProductRecommendation[]>
    
    // Analizar búsqueda de productos
    async analyzeProductSearch(query: string): Promise<any>
    
    // Ayuda con compra específica
    async helpWithPurchase(productInfo: any): Promise<AIResponse>
}
```

### AIAssistant.tsx - Estados y Hooks

```typescript
const [isOpen, setIsOpen] = useState(false);        // Panel abierto/cerrado
const [messages, setMessages] = useState<AIMessage[]>([]);  // Historial
const [inputMessage, setInputMessage] = useState('');       // Texto input
const [isLoading, setIsLoading] = useState(false);         // Indicador carga
const [suggestions, setSuggestions] = useState<string[]>([]); // Sugerencias

// Inicializar conversación al abrir
useEffect(() => {
    if (isOpen && messages.length === 0) {
        initializeConversation();
    }
}, [isOpen]);

// Auto-scroll al final
useEffect(() => {
    scrollToBottom();
}, [messages]);
```

### Flujo de Conversación

```
1. Usuario abre el asistente (click en botón flotante)
   ↓
2. useEffect detecta isOpen=true y messages.length=0
   ↓
3. initializeConversation() llama a aiService.startConversation()
   ↓
4. AIService intenta conectar con backend
   ↓
5. Si falla → offlineMode=true
   ↓
6. Muestra mensaje de bienvenida
   ↓
7. Usuario escribe mensaje
   ↓
8. handleSendMessage() envía a aiService.sendMessage()
   ↓
9. getOfflineResponse() analiza patrones y retorna respuesta
   ↓
10. Respuesta se agrega a messages con sugerencias
    ↓
11. Usuario puede escribir nuevo mensaje o click en sugerencia
```

## 🔄 Activar Modo Online

Si el **AI Orchestrator** está disponible en el puerto 6000:

### 1. Levantar AI Orchestrator

```bash
cd Autonomo2/ai-orchestrator
npm install
npm run dev
```

### 2. Backend Responde

El AIService detectará automáticamente que el backend está disponible:

```typescript
async startConversation() {
    try {
        const response = await httpClient.post('/ai/conversation/start');
        this.offlineMode = false; // ✅ Modo online activado
        return response.conversationId;
    } catch (error) {
        this.offlineMode = true;  // ⚠️ Modo offline activado
    }
}
```

### 3. Capacidades Adicionales en Modo Online

Con el backend real, el asistente puede:
- 🧠 **Procesamiento NLP avanzado**: Comprensión de lenguaje natural
- 🔍 **Búsqueda semántica**: Encontrar productos por similitud
- 📊 **Análisis de preferencias**: Recomendaciones personalizadas
- 🔗 **Integración con MCP Tools**: 
  - `search_products_tool`: Búsqueda en base de datos
  - `get_product_details_tool`: Detalles completos
  - `add_to_cart_tool`: Agregar al carrito desde chat
  - `check_stock_tool`: Verificar disponibilidad
  - `get_recommendations_tool`: IA con historial de usuario
  - `track_order_tool`: Estado de pedidos

## 📊 Comparación: Offline vs Online

| Característica | Modo Offline | Modo Online |
|----------------|--------------|-------------|
| **Latencia** | 800ms simulado | Variable (API real) |
| **Respuestas** | Basadas en patrones | NLP + Machine Learning |
| **Productos** | 25 ejemplos estáticos | DB dinámica completa |
| **Recomendaciones** | Aleatorias | Personalizadas por IA |
| **Búsqueda** | String matching simple | Búsqueda semántica |
| **Context awareness** | Ninguno | Historial de usuario |
| **MCP Tools** | ❌ No disponible | ✅ 6 herramientas |
| **Aprendizaje** | ❌ Estático | ✅ Mejora con uso |

## 🎯 Mejores Prácticas de Uso

### Para Usuarios:

1. **Sé específico**: "Busco laptop gaming bajo $1000" es mejor que "laptop"
2. **Usa las sugerencias**: Los botones rápidos aceleran la navegación
3. **Pregunta lo que necesites**: El asistente entiende lenguaje natural
4. **Explora categorías**: Pregunta "¿qué vendes?" para ver opciones

### Para Desarrolladores:

1. **Agregar nuevos patrones**: Editar `getOfflineResponse()` en `AIService.ts`
2. **Personalizar respuestas**: Modificar mensajes según marca/idioma
3. **Extender productos**: Actualizar `productos-ejemplo.ts`
4. **Ajustar delay**: Cambiar `setTimeout(800)` para simular latencia diferente

## 🐛 Resolución de Problemas

### El asistente no responde
- ✅ Verifica que el botón flotante esté visible (esquina inferior derecha)
- ✅ Abre la consola del navegador (F12) y busca errores
- ✅ Intenta refrescar la página: `Ctrl+Shift+R`

### Las sugerencias no aparecen
- ✅ Asegúrate de que las respuestas incluyan el campo `suggestions`
- ✅ Verifica que `setSuggestions()` se ejecute en `handleSendMessage()`

### Respuestas genéricas
- ✅ El mensaje no coincide con ningún patrón conocido
- ✅ Reformula la pregunta usando palabras clave reconocidas
- ✅ Usa las sugerencias para navegar

### Errores de compilación
```bash
# Reinstalar dependencias
cd marketplace-frontend
npm install

# Verificar tipos
npm run build
```

## 🚀 Próximas Mejoras

### Funcionalidades Pendientes:

- [ ] **Búsqueda con imágenes**: Subir foto de producto deseado
- [ ] **Comparación de productos**: "Compara iPhone vs Samsung"
- [ ] **Historial de conversaciones**: Guardar en localStorage
- [ ] **Voz**: Speech-to-text y text-to-speech
- [ ] **Multiidioma**: Detectar idioma del usuario
- [ ] **Integración con carrito**: Agregar productos desde chat
- [ ] **Notificaciones**: Alertas de ofertas personalizadas
- [ ] **Analytics**: Trackear preguntas frecuentes

### Optimizaciones:

- [ ] **Caché de respuestas**: Guardar respuestas comunes
- [ ] **Lazy loading**: Cargar componente solo cuando se usa
- [ ] **Compresión**: Minificar mensajes largos
- [ ] **Web Workers**: Procesamiento en background

## 📖 Ejemplos de Conversación Completa

### Flujo 1: Usuario Busca Regalo

```
Usuario: "Hola, busco un regalo"
IA: "¡Hola! 👋 ¿Para quién es el regalo? Te puedo ayudar a 
     encontrar algo perfecto según la persona."
[Sugerencias: Para él | Para ella | Para niños]

Usuario: [click en "Para ella"]
IA: "💐 Aquí tienes algunas ideas de regalo para ella:

• Smartwatch Fitness - $149
• Auriculares Premium - $89
• Set de Skincare - $59

¿Qué presupuesto tienes en mente?"
[Sugerencias: Menos de $50 | $50-$100 | Más de $100]

Usuario: [click en "$50-$100"]
IA: "Perfecto! En ese rango tengo:

• **Auriculares Premium Bluetooth** - $89
  Cancelación de ruido, 30hrs batería
  
• **Smartband Fitness Tracker** - $69
  Monitor cardíaco, resistente al agua

¿Te gustaría agregar alguno al carrito?"
[Sugerencias: Agregar auriculares | Agregar smartband | Ver más]
```

### Flujo 2: Consulta de Envío

```
Usuario: "Necesito que llegue mañana"
IA: "📦 Para entrega rápida tenemos:

• **Envío Express**: 2-3 días - $9.99
• **Same-day**: Mismo día - $19.99 (solo ciudades selectas)

¿En qué ciudad te encuentras?"

Usuario: "Santiago"
IA: "✅ ¡Genial! Santiago tiene disponible envío same-day.

Si realizas tu pedido antes de las 2 PM, llega hoy mismo.
Después de las 2 PM, llega mañana.

¿Quieres proceder con la compra?"
[Sugerencias: Ver carrito | Agregar productos | Métodos de pago]
```

## 💡 Tips para Mejorar la Experiencia

1. **Personalización**: Guarda preferencias del usuario en localStorage
2. **Contexto**: Usa `conversationHistory` para respuestas más inteligentes
3. **Feedback**: Agrega botones 👍👎 para mejorar respuestas
4. **Shortcuts**: Implementa comandos rápidos `/help`, `/productos`, etc.
5. **Animaciones**: Suaviza transiciones entre mensajes

---

**✨ ¡El asistente IA está listo para ayudar a tus usuarios! ✨**

🤖 Modo offline completamente funcional con respuestas inteligentes
🎯 Sugerencias contextuales para mejor UX
💬 Interfaz moderna y responsiva
🚀 Fácil de extender y personalizar
