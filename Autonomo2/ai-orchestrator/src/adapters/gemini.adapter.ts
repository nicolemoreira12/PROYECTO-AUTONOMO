import { GoogleGenerativeAI, GenerativeModel, Content } from '@google/generative-ai';
import { BaseLLMAdapter } from './base.adapter';
import { LLMRequest, LLMResponse, Message, MessageRole, ToolCall } from '../types';

/**
 * Adapter para Google Gemini (Gemini Pro)
 * Implementación del patrón Strategy para LLM Provider
 */
export class GeminiAdapter extends BaseLLMAdapter {
    readonly name = 'gemini';
    private client: GoogleGenerativeAI;
    private model: GenerativeModel;

    constructor(apiKey?: string) {
        super();
        const key = apiKey || process.env.GEMINI_API_KEY;
        this.validateConfig(key);

        this.client = new GoogleGenerativeAI(key!);
        this.model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });

        console.log(`✅ Gemini Adapter inicializado`);
    }

    /**
     * Genera respuesta usando Google Gemini
     */
    async generateResponse(request: LLMRequest): Promise<LLMResponse> {
        try {
            const { messages, tools, temperature = 0.7, maxTokens = 1024 } = request;

            // Construir historial de chat para Gemini
            const history = this.buildGeminiHistory(messages);

            // Último mensaje del usuario
            const lastUserMessage = messages
                .filter(m => m.role === MessageRole.USER)
                .pop()?.content || '';

            // Iniciar chat
            const chat = this.model.startChat({
                history,
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                },
            });

            // Enviar mensaje
            const result = await chat.sendMessage(lastUserMessage);
            const response = result.response;
            const text = response.text();

            // Detectar si el modelo quiere usar una herramienta
            const toolCalls = this.detectToolCalls(text, tools);

            return {
                content: text,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                finishReason: toolCalls.length > 0 ? 'tool_call' : 'stop',
                usage: {
                    inputTokens: 0, // Gemini no proporciona esta info fácilmente
                    outputTokens: 0,
                    totalTokens: 0,
                },
            };
        } catch (error) {
            console.error('Error en Gemini:', error);
            return this.handleError(error);
        }
    }

    /**
     * Procesa imágenes usando Gemini Pro Vision
     */
    async processImage(imageData: Buffer | string): Promise<string> {
        try {
            const visionModel = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const imageParts = [{
                inlineData: {
                    data: typeof imageData === 'string' ? imageData : imageData.toString('base64'),
                    mimeType: 'image/jpeg',
                },
            }];

            const result = await visionModel.generateContent([
                'Describe esta imagen en detalle. Si es un documento, extrae el texto.',
                ...imageParts,
            ]);

            const response = result.response;
            return response.text();
        } catch (error) {
            console.error('Error procesando imagen con Gemini:', error);
            throw error;
        }
    }

    /**
     * Construye el historial en formato Gemini
     */
    private buildGeminiHistory(messages: Message[]): Content[] {
        // Gemini no acepta mensajes del sistema en el historial
        const chatMessages = messages.filter(
            m => m.role === MessageRole.USER || m.role === MessageRole.ASSISTANT
        );

        const history = chatMessages.map(msg => ({
            role: msg.role === MessageRole.USER ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        // Gemini requiere que el primer mensaje sea 'user'
        // Si el historial está vacío o comienza con 'model', lo ajustamos
        if (history.length > 0 && history[0].role === 'model') {
            // Eliminar el primer mensaje si es del modelo
            history.shift();
        }

        return history;
    }

    /**
     * Detecta si el modelo está solicitando usar una herramienta
     * Gemini no tiene function calling nativo, así que detectamos patrones
     */
    private detectToolCalls(text: string, tools?: any[]): ToolCall[] {
        if (!tools || tools.length === 0) return [];

        const toolCalls: ToolCall[] = [];

        // Buscar patrones como: "usar herramienta: buscar_productos con query='laptop'"
        const toolPattern = /usar\s+herramienta:\s*(\w+)\s*con\s*(.+)/i;
        const match = text.match(toolPattern);

        if (match) {
            const toolName = match[1];
            const argsString = match[2];

            // Parsear argumentos (formato simple: key='value', key2='value2')
            const args: Record<string, any> = {};
            const argPattern = /(\w+)='([^']+)'/g;
            let argMatch;

            while ((argMatch = argPattern.exec(argsString)) !== null) {
                args[argMatch[1]] = argMatch[2];
            }

            // Verificar si la herramienta existe
            const tool = tools.find(t => t.name === toolName);
            if (tool) {
                toolCalls.push({ toolName, arguments: args });
            }
        }

        // También buscar nombres de herramientas mencionados explícitamente
        for (const tool of tools) {
            const toolMention = new RegExp(`\\b${tool.name}\\b`, 'i');
            if (toolMention.test(text) && toolCalls.length === 0) {
                // Si menciona una herramienta pero no tenemos los args, pedirlos
                console.log(`Herramienta mencionada: ${tool.name}, pero faltan argumentos`);
            }
        }

        return toolCalls;
    }
}
