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
     * Genera respuesta usando Google Gemini con Function Calling nativo
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

            // Si hay tools disponibles, crear modelo con function calling
            let model = this.model;
            if (tools && tools.length > 0) {
                const geminiTools = this.convertToolsToGeminiFormat(tools);
                model = this.client.getGenerativeModel({
                    model: 'gemini-2.5-flash',
                    tools: geminiTools,
                    systemInstruction: `Eres un asistente útil para un marketplace. Tienes acceso a las siguientes herramientas:
${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

Cuando el usuario pida información sobre productos, órdenes, pagos o reportes, DEBES usar las herramientas disponibles.
Si no tienes herramientas para una tarea específica, explícale al usuario qué puedes hacer.`,
                });
            }

            // Iniciar chat
            const chat = model.startChat({
                history,
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                },
            });

            // Enviar mensaje
            const result = await chat.sendMessage(lastUserMessage);
            const response = result.response;

            // Verificar si hay function calls
            const functionCalls = response.functionCalls();
            
            if (functionCalls && functionCalls.length > 0) {
                // Gemini está solicitando usar herramientas
                const toolCalls: ToolCall[] = functionCalls.map((fc: any) => ({
                    toolName: fc.name,
                    arguments: fc.args || {},
                }));

                return {
                    content: response.text() || 'Usando herramientas...',
                    toolCalls,
                    finishReason: 'tool_call',
                    usage: {
                        inputTokens: 0,
                        outputTokens: 0,
                        totalTokens: 0,
                    },
                };
            }

            // Respuesta normal sin tool calls
            return {
                content: response.text(),
                finishReason: 'stop',
                usage: {
                    inputTokens: 0,
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
     * Convierte tools MCP al formato de Gemini Function Calling
     */
    private convertToolsToGeminiFormat(tools: any[]): any[] {
        return [{
            functionDeclarations: tools.map(tool => {
                // Convertir array de ToolParameter a JSON Schema
                const properties: any = {};
                const required: string[] = [];

                if (tool.parameters && Array.isArray(tool.parameters)) {
                    tool.parameters.forEach((param: any) => {
                        const propDef: any = {
                            type: param.type,
                            description: param.description,
                        };

                        // Si es array, necesitamos definir el tipo de items
                        if (param.type === 'array') {
                            propDef.items = {
                                type: 'object', // Para arrays de objetos como productos
                            };
                        }

                        if (param.enum) {
                            propDef.enum = param.enum;
                        }

                        properties[param.name] = propDef;

                        if (param.required) {
                            required.push(param.name);
                        }
                    });
                }

                return {
                    name: tool.name,
                    description: tool.description,
                    parameters: {
                        type: 'object',
                        properties,
                        required,
                    },
                };
            }),
        }];
    }

    /**
     * Construye el historial en formato Gemini
     */
    private buildGeminiHistory(messages: Message[]): Content[] {
        const history: Content[] = [];

        for (const msg of messages) {
            if (msg.role === MessageRole.USER) {
                history.push({
                    role: 'user',
                    parts: [{ text: msg.content }],
                });
            } else if (msg.role === MessageRole.ASSISTANT) {
                history.push({
                    role: 'model',
                    parts: [{ text: msg.content }],
                });
            } else if (msg.role === MessageRole.TOOL) {
                // Agregar el resultado de la herramienta como functionResponse
                try {
                    const toolResult = JSON.parse(msg.content);
                    const toolCall = msg.metadata?.toolCall;

                    if (toolCall) {
                        // Primero agregamos el function call del modelo
                        history.push({
                            role: 'model',
                            parts: [{
                                functionCall: {
                                    name: toolCall.toolName,
                                    args: toolCall.arguments,
                                },
                            }],
                        });

                        // Luego agregamos la respuesta de la función con role 'function'
                        history.push({
                            role: 'function' as any,
                            parts: [{
                                functionResponse: {
                                    name: toolCall.toolName,
                                    response: toolResult,
                                },
                            }],
                        });
                    }
                } catch (e) {
                    console.warn('Error procesando mensaje TOOL:', e);
                }
            }
        }

        // Gemini requiere que el primer mensaje sea 'user'
        if (history.length > 0 && history[0].role === 'model') {
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
