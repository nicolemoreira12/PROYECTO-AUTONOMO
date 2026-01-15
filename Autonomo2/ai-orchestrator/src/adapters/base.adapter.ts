import { ILLMProvider, LLMRequest, LLMResponse, Message, MessageRole } from '../types';

/**
 * Clase base abstracta para todos los proveedores LLM
 * Implementa el patrón Template Method para operaciones comunes
 */
export abstract class BaseLLMAdapter implements ILLMProvider {
    abstract readonly name: string;

    /**
     * Método abstracto que cada proveedor debe implementar
     */
    abstract generateResponse(request: LLMRequest): Promise<LLMResponse>;

    /**
     * Método opcional para procesar imágenes (multimodal)
     */
    async processImage?(imageData: Buffer | string): Promise<string>;

    /**
     * Método opcional para transcribir audio
     */
    async transcribeAudio?(audioData: Buffer): Promise<string>;

    /**
     * Convierte mensajes del formato interno al formato del proveedor
     * Este método puede ser sobrescrito por las clases hijas si necesitan
     * un formato específico
     */
    protected formatMessages(messages: Message[]): any[] {
        return messages.map(msg => ({
            role: this.mapRole(msg.role),
            content: msg.content,
        }));
    }

    /**
     * Mapea roles internos a roles del proveedor
     */
    protected mapRole(role: MessageRole): string {
        switch (role) {
            case MessageRole.USER:
                return 'user';
            case MessageRole.ASSISTANT:
                return 'assistant';
            case MessageRole.SYSTEM:
                return 'system';
            case MessageRole.TOOL:
                return 'function';
            default:
                return 'user';
        }
    }

    /**
     * Valida la configuración del adapter
     */
    protected validateConfig(apiKey?: string): void {
        if (!apiKey) {
            throw new Error(`API Key no configurada para ${this.name}`);
        }
    }

    /**
     * Manejo de errores común
     */
    protected handleError(error: any): LLMResponse {
        console.error(`Error en ${this.name}:`, error);
        return {
            content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta nuevamente.',
            finishReason: 'error',
            usage: {
                inputTokens: 0,
                outputTokens: 0,
                totalTokens: 0,
            },
        };
    }

    /**
     * Construye el prompt del sistema con información de herramientas
     */
    protected buildSystemPromptWithTools(tools?: any[]): string {
        if (!tools || tools.length === 0) {
            return 'Eres un asistente útil y amigable.';
        }

        const toolDescriptions = tools.map(tool =>
            `- ${tool.name}: ${tool.description}`
        ).join('\n');

        return `Eres un asistente de IA conversacional que puede usar las siguientes herramientas para ayudar al usuario:

${toolDescriptions}

Cuando necesites usar una herramienta, indica claramente cuál herramienta usar y qué parámetros necesitas.`;
    }
}
