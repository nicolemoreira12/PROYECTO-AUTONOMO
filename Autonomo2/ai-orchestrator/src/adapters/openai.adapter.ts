import OpenAI from 'openai';
import { BaseLLMAdapter } from './base.adapter';
import { LLMRequest, LLMResponse, Message, MessageRole, ToolCall, ToolDefinition } from '../types';

/**
 * Adapter para OpenAI (GPT-4, GPT-3.5)
 * Implementación del patrón Strategy para LLM Provider
 */
export class OpenAIAdapter extends BaseLLMAdapter {
    readonly name = 'openai';
    private client: OpenAI;
    private model: string;

    constructor(apiKey?: string, model?: string) {
        super();
        const key = apiKey || process.env.OPENAI_API_KEY;
        this.validateConfig(key);

        this.client = new OpenAI({ apiKey: key });
        this.model = model || process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

        console.log(`✅ OpenAI Adapter inicializado (modelo: ${this.model})`);
    }

    /**
     * Genera respuesta usando OpenAI
     */
    async generateResponse(request: LLMRequest): Promise<LLMResponse> {
        try {
            const { messages, tools, temperature = 0.7, maxTokens = 1024 } = request;

            // Construir mensajes en formato OpenAI
            const openaiMessages = this.buildOpenAIMessages(messages);

            // Construir tools en formato OpenAI (function calling)
            const openaiTools = tools ? this.buildOpenAITools(tools) : undefined;

            // Llamada a la API
            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: openaiMessages as any,
                temperature,
                max_tokens: maxTokens,
                tools: openaiTools,
                tool_choice: openaiTools ? 'auto' : undefined,
            });

            const choice = completion.choices[0];
            const content = choice.message.content || '';
            const toolCalls = choice.message.tool_calls;

            // Procesar tool calls si existen
            const extractedToolCalls: ToolCall[] = [];
            if (toolCalls && toolCalls.length > 0) {
                for (const tc of toolCalls) {
                    extractedToolCalls.push({
                        toolName: tc.function.name,
                        arguments: JSON.parse(tc.function.arguments),
                    });
                }
            }

            return {
                content,
                toolCalls: extractedToolCalls.length > 0 ? extractedToolCalls : undefined,
                finishReason: this.mapFinishReason(choice.finish_reason),
                usage: {
                    inputTokens: completion.usage?.prompt_tokens || 0,
                    outputTokens: completion.usage?.completion_tokens || 0,
                    totalTokens: completion.usage?.total_tokens || 0,
                },
            };
        } catch (error) {
            console.error('Error en OpenAI:', error);
            return this.handleError(error);
        }
    }

    /**
     * Procesa imágenes usando GPT-4 Vision
     */
    async processImage(imageData: Buffer | string): Promise<string> {
        try {
            const base64Image = typeof imageData === 'string'
                ? imageData
                : imageData.toString('base64');

            const response = await this.client.chat.completions.create({
                model: 'gpt-4-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Describe esta imagen en detalle. Si es un documento, extrae el texto.',
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 1024,
            });

            return response.choices[0].message.content || '';
        } catch (error) {
            console.error('Error procesando imagen con OpenAI:', error);
            throw error;
        }
    }

    /**
     * Transcribe audio usando Whisper
     */
    async transcribeAudio(audioData: Buffer): Promise<string> {
        try {
            // Crear un archivo temporal para Whisper
            const file = new File([audioData], 'audio.mp3', { type: 'audio/mpeg' });

            const transcription = await this.client.audio.transcriptions.create({
                file,
                model: 'whisper-1',
            });

            return transcription.text;
        } catch (error) {
            console.error('Error transcribiendo audio con Whisper:', error);
            throw error;
        }
    }

    /**
     * Construye mensajes en formato OpenAI
     */
    private buildOpenAIMessages(messages: Message[]): any[] {
        // Agregar mensaje del sistema si hay herramientas
        const systemMessage = {
            role: 'system',
            content: 'Eres un asistente útil que puede usar herramientas para ayudar al usuario.',
        };

        const chatMessages = messages.map(msg => ({
            role: this.mapRoleToOpenAI(msg.role),
            content: msg.content,
        }));

        return [systemMessage, ...chatMessages];
    }

    /**
     * Mapea roles internos a roles de OpenAI
     */
    private mapRoleToOpenAI(role: MessageRole): string {
        switch (role) {
            case MessageRole.USER:
                return 'user';
            case MessageRole.ASSISTANT:
                return 'assistant';
            case MessageRole.SYSTEM:
                return 'system';
            case MessageRole.TOOL:
                return 'tool';
            default:
                return 'user';
        }
    }

    /**
     * Construye tools en formato OpenAI (function calling)
     */
    private buildOpenAITools(tools: ToolDefinition[]): any[] {
        return tools.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: 'object',
                    properties: this.buildParameters(tool.parameters),
                    required: tool.parameters
                        .filter(p => p.required)
                        .map(p => p.name),
                },
            },
        }));
    }

    /**
     * Construye parámetros en formato JSON Schema
     */
    private buildParameters(params: any[]): Record<string, any> {
        const properties: Record<string, any> = {};

        for (const param of params) {
            properties[param.name] = {
                type: param.type,
                description: param.description,
            };

            if (param.enum) {
                properties[param.name].enum = param.enum;
            }
        }

        return properties;
    }

    /**
     * Mapea finish_reason de OpenAI a nuestro formato
     */
    private mapFinishReason(reason?: string): 'stop' | 'tool_call' | 'length' | 'error' {
        switch (reason) {
            case 'stop':
                return 'stop';
            case 'tool_calls':
                return 'tool_call';
            case 'length':
                return 'length';
            default:
                return 'stop';
        }
    }
}
