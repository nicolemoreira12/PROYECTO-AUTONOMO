import { httpClient } from '../api/http-client';
import { productosEjemplo } from '../data/productos-ejemplo';

export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
}

export interface AIResponse {
    message: string;
    conversationId?: string;
    suggestions?: string[];
    error?: string;
}

export interface ProductRecommendation {
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
    score: number;
}

class AIService {
    private conversationId: string | null = null;
    private offlineMode = false;
    private conversationHistory: AIMessage[] = [];

    // Respuestas offline basadas en patrones
    private getOfflineResponse(message: string): AIResponse {
        const lowerMessage = message.toLowerCase();

        // Patrones de saludo
        if (lowerMessage.match(/^(hola|hi|hey|buenos|buenas|saludos)/i)) {
            return {
                message: '¡Hola! 👋 Soy tu asistente virtual del Marketplace. Estoy aquí para ayudarte a encontrar los mejores productos.\n\n¿En qué puedo ayudarte hoy?\n\n💡 Puedes preguntarme sobre:\n• Recomendaciones de productos\n• Información sobre categorías\n• Ayuda con compras\n• Estado de pedidos',
                conversationId: 'offline-demo',
                suggestions: ['Ver productos', 'Buscar ofertas', '¿Qué vendes?'],
            };
        }

        // Patrones de recomendación
        if (lowerMessage.match(/recomien|sugerir|mejor|bueno|producto/i)) {
            const randomProducts = this.getRandomProducts(3);
            const productList = randomProducts
                .map(p => `• **${p.nombre}** - $${p.precio}\n  ${p.descripcion.substring(0, 80)}...`)
                .join('\n\n');

            return {
                message: `¡Claro! 🎯 Aquí tienes algunas recomendaciones basadas en nuestros productos más populares:\n\n${productList}\n\n¿Te gustaría saber más sobre alguno de estos productos?`,
                conversationId: 'offline-demo',
                suggestions: ['Ver más productos', 'Buscar por categoría', 'Ofertas especiales'],
            };
        }

        // Patrones de categorías
        if (lowerMessage.match(/categor|tipo|qué vend|que vend/i)) {
            return {
                message: '📦 Tenemos una amplia variedad de productos en diferentes categorías:\n\n• **Electrónica** - Laptops, smartphones, accesorios\n• **Ropa y Moda** - Ropa, calzado, accesorios\n• **Hogar y Jardín** - Decoración, muebles, plantas\n• **Deportes** - Equipamiento deportivo\n• **Libros y Educación** - Libros, cursos\n\n¿Qué categoría te interesa explorar?',
                conversationId: 'offline-demo',
                suggestions: ['Ver electrónica', 'Ver ropa', 'Ver todo'],
            };
        }

        // Patrones de precio
        if (lowerMessage.match(/precio|cuanto|cost|barato|económico|oferta/i)) {
            const affordableProducts = productosEjemplo
                .filter(p => p.precio < 50)
                .slice(0, 3);
            
            const productList = affordableProducts
                .map(p => `• ${p.nombre} - **$${p.precio}**`)
                .join('\n');

            return {
                message: `💰 Aquí tienes algunos productos económicos:\n\n${productList}\n\nTodos nuestros productos tienen precios competitivos. ¿Te gustaría ver más opciones?`,
                conversationId: 'offline-demo',
                suggestions: ['Ver ofertas', 'Productos bajo $30', 'Ver todo'],
            };
        }

        // Patrones de compra/carrito
        if (lowerMessage.match(/comprar|carrito|pagar|pedido|orden/i)) {
            return {
                message: '🛒 Para realizar una compra:\n\n1. Explora nuestros productos\n2. Haz clic en "Agregar al carrito"\n3. Ve al carrito (icono arriba derecha)\n4. Revisa tu orden\n5. Procede al pago\n\n✅ Aceptamos:\n• Tarjetas de crédito/débito\n• PayPal y wallets digitales\n• Criptomonedas\n• Transferencias bancarias\n• Efectivo contra entrega\n\n¿Necesitas ayuda con algo específico?',
                conversationId: 'offline-demo',
                suggestions: ['Ver carrito', 'Métodos de pago', 'Envíos'],
            };
        }

        // Patrones de envío
        if (lowerMessage.match(/envío|envio|entrega|delivery|shipping/i)) {
            return {
                message: '📦 Información de envíos:\n\n• **Envío estándar**: 5-7 días hábiles - GRATIS en compras +$50\n• **Envío express**: 2-3 días hábiles - $9.99\n• **Envío same-day**: Mismo día - $19.99 (ciudades selectas)\n\n🎁 Envío gratis en compras mayores a $50\n\n¿Deseas agregar productos al carrito?',
                conversationId: 'offline-demo',
                suggestions: ['Ver productos', 'Calcular envío', 'Políticas'],
            };
        }

        // Patrones de ayuda
        if (lowerMessage.match(/ayuda|help|cómo|como|no entiendo/i)) {
            return {
                message: '🤖 ¡Estoy aquí para ayudarte!\n\nPuedo asistirte con:\n\n✅ **Encontrar productos** - Dime qué buscas\n✅ **Recomendaciones** - Te sugiero productos\n✅ **Información** - Categorías, precios, envíos\n✅ **Proceso de compra** - Guía paso a paso\n✅ **Dudas generales** - Políticas, devoluciones, etc.\n\n¿Qué te gustaría saber?',
                conversationId: 'offline-demo',
                suggestions: ['Buscar producto', 'Ver categorías', 'Cómo comprar'],
            };
        }

        // Patrones de búsqueda específica (laptop, teléfono, etc.)
        if (lowerMessage.match(/laptop|computador|pc|ordenador/i)) {
            const laptops = productosEjemplo.filter(p => 
                p.nombre.toLowerCase().includes('laptop') || 
                p.nombre.toLowerCase().includes('macbook')
            );
            
            if (laptops.length > 0) {
                const productList = laptops
                    .map(p => `• **${p.nombre}** - $${p.precio}\n  ${p.descripcion.substring(0, 60)}...`)
                    .join('\n\n');
                
                return {
                    message: `💻 Encontré estas laptops para ti:\n\n${productList}\n\n¿Te interesa alguna en particular?`,
                    conversationId: 'offline-demo',
                    suggestions: ['Ver detalles', 'Comparar', 'Agregar al carrito'],
                };
            }
        }

        if (lowerMessage.match(/teléfono|telefono|celular|smartphone|móvil|movil/i)) {
            const phones = productosEjemplo.filter(p => 
                p.nombre.toLowerCase().includes('iphone') || 
                p.nombre.toLowerCase().includes('samsung')
            );
            
            if (phones.length > 0) {
                const productList = phones
                    .map(p => `• **${p.nombre}** - $${p.precio}`)
                    .join('\n');
                
                return {
                    message: `📱 Tenemos estos smartphones disponibles:\n\n${productList}\n\n¿Quieres ver más información sobre alguno?`,
                    conversationId: 'offline-demo',
                    suggestions: ['Ver especificaciones', 'Comparar modelos', 'Ofertas'],
                };
            }
        }

        // Patrones de despedida
        if (lowerMessage.match(/^(adiós|adios|chao|bye|hasta luego|nos vemos)/i)) {
            return {
                message: '👋 ¡Hasta luego! Gracias por visitar nuestro Marketplace.\n\nSi necesitas algo más, estaré aquí para ayudarte. ¡Que tengas un excelente día! 😊',
                conversationId: 'offline-demo',
            };
        }

        // Patrones de agradecimiento
        if (lowerMessage.match(/gracias|thank/i)) {
            return {
                message: '¡De nada! 😊 Es un placer ayudarte.\n\n¿Hay algo más en lo que pueda asistirte?',
                conversationId: 'offline-demo',
                suggestions: ['Ver productos', 'Buscar ofertas', 'Finalizar'],
            };
        }

        // Respuesta por defecto
        return {
            message: `Entiendo que preguntas sobre "${message}".\n\n🤖 Actualmente estoy en modo demo y puedo ayudarte con:\n\n• Información sobre productos\n• Recomendaciones personalizadas\n• Proceso de compra\n• Métodos de pago y envío\n• Preguntas generales\n\n¿Podrías reformular tu pregunta o elegir una de las opciones sugeridas?`,
            conversationId: 'offline-demo',
            suggestions: ['Ver productos', 'Recomendaciones', 'Cómo comprar'],
        };
    }

    private getRandomProducts(count: number): typeof productosEjemplo {
        const shuffled = [...productosEjemplo].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    async startConversation(): Promise<string | null> {
        try {
            const response = await httpClient.post<any>(`/ai/conversation/start`);
            this.conversationId = response.conversationId;
            this.offlineMode = false;
            return this.conversationId;
        } catch (error) {
            console.warn('⚠️ AI Orchestrator no disponible, usando modo offline');
            this.offlineMode = true;
            this.conversationId = 'offline-demo';
            return this.conversationId;
        }
    }

    async sendMessage(message: string): Promise<AIResponse> {
        // Si estamos en modo offline, usar respuestas simuladas
        if (this.offlineMode) {
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 800));
            return this.getOfflineResponse(message);
        }

        try {
            if (!this.conversationId) {
                await this.startConversation();
            }

            // Si después de iniciar seguimos offline, usar respuesta simulada
            if (this.offlineMode) {
                await new Promise(resolve => setTimeout(resolve, 800));
                return this.getOfflineResponse(message);
            }

            const response = await httpClient.post<any>(`/ai/chat`, {
                message,
                conversationId: this.conversationId,
            });

            return {
                message: response.message || response.response,
                conversationId: this.conversationId || undefined,
                suggestions: response.suggestions,
            };
        } catch (error: any) {
            console.warn('⚠️ Error con AI backend, cambiando a modo offline');
            this.offlineMode = true;
            await new Promise(resolve => setTimeout(resolve, 800));
            return this.getOfflineResponse(message);
        }
    }

    async getProductRecommendations(preferences?: string[]): Promise<ProductRecommendation[]> {
        if (this.offlineMode) {
            // Retornar productos aleatorios como recomendaciones
            const randomProducts = this.getRandomProducts(5);
            return randomProducts.map(p => ({
                id: p.id,
                nombre: p.nombre,
                precio: p.precio,
                descripcion: p.descripcion,
                score: Math.random() * 0.3 + 0.7, // Score entre 0.7 y 1.0
            }));
        }

        try {
            const response = await httpClient.post<any>(`/ai/recommendations`, {
                preferences,
                conversationId: this.conversationId,
            });

            return response.recommendations || [];
        } catch (error) {
            console.warn('⚠️ Recomendaciones offline activadas');
            this.offlineMode = true;
            
            const randomProducts = this.getRandomProducts(5);
            return randomProducts.map(p => ({
                id: p.id,
                nombre: p.nombre,
                precio: p.precio,
                descripcion: p.descripcion,
                score: Math.random() * 0.3 + 0.7,
            }));
        }
    }

    async analyzeProductSearch(query: string): Promise<any> {
        if (this.offlineMode) {
            // Búsqueda simple en productos de ejemplo
            const results = productosEjemplo.filter(p =>
                p.nombre.toLowerCase().includes(query.toLowerCase()) ||
                p.descripcion.toLowerCase().includes(query.toLowerCase())
            );

            return {
                results: results.slice(0, 5),
                suggestions: ['laptop', 'iphone', 'auriculares', 'reloj'],
                query,
            };
        }

        try {
            return await httpClient.post<any>(`/ai/analyze-search`, {
                query,
            });
        } catch (error) {
            console.warn('⚠️ Análisis offline activado');
            this.offlineMode = true;
            
            const results = productosEjemplo.filter(p =>
                p.nombre.toLowerCase().includes(query.toLowerCase()) ||
                p.descripcion.toLowerCase().includes(query.toLowerCase())
            );

            return {
                results: results.slice(0, 5),
                suggestions: ['laptop', 'iphone', 'auriculares', 'reloj'],
                query,
            };
        }
    }

    async helpWithPurchase(productInfo: any): Promise<AIResponse> {
        if (this.offlineMode) {
            await new Promise(resolve => setTimeout(resolve, 600));
            return {
                message: `📦 **${productInfo.nombre}** - $${productInfo.precio}\n\n${productInfo.descripcion}\n\n✅ **Disponible en stock**\n\nPara comprar:\n1. Haz clic en "Agregar al carrito"\n2. Ve al carrito\n3. Procede al pago\n\n¿Necesitas más información sobre este producto?`,
                conversationId: 'offline-demo',
                suggestions: ['Agregar al carrito', 'Ver similares', 'Métodos de pago'],
            };
        }

        try {
            const message = `Necesito ayuda con este producto: ${JSON.stringify(productInfo)}`;
            return await this.sendMessage(message);
        } catch (error: any) {
            this.offlineMode = true;
            await new Promise(resolve => setTimeout(resolve, 600));
            return {
                message: `📦 **${productInfo.nombre}**\n\nEste producto está disponible. Puedo ayudarte con:\n\n• Información detallada\n• Comparación con similares\n• Proceso de compra\n• Métodos de pago\n\n¿Qué te gustaría saber?`,
                conversationId: 'offline-demo',
                suggestions: ['Ver detalles', 'Comparar', 'Comprar'],
            };
        }
    }

    resetConversation() {
        this.conversationId = null;
    }
}

export const aiService = new AIService();
