import { v4 as uuidv4 } from 'uuid';
import { LLMFactory } from '../adapters';
import { ToolRegistry } from '../tools';
import {
    Message,
    MessageRole,
    MessageType,
    OrchestrationRequest,
    OrchestrationResponse,
    LLMRequest,
    ToolCall,
} from '../types';
import {
    getConversationContext,
    saveConversationContext,
    deleteConversationContext,
} from '../config/redis.config';

/**
 * Servicio Orchestrator - Cerebro del sistema
 * Coordina LLM Adapters + MCP Tools + Contexto de conversación
 */
export class OrchestratorService {
    private maxContextMessages: number;
    private conversationTimeoutMinutes: number;

    constructor() {
        this.maxContextMessages = parseInt(process.env.MAX_CONTEXT_MESSAGES || '10');
        this.conversationTimeoutMinutes = parseInt(process.env.CONVERSATION_TIMEOUT_MINUTES || '30');
    }

    /**
     * Procesa un mensaje del usuario y genera respuesta
     * Este es el método principal del orchestrator
     */
    async processMessage(request: OrchestrationRequest): Promise<OrchestrationResponse> {
        try {
            console.log(`🤖 Procesando mensaje para conversación: ${request.conversationId}`);

            // 1. Obtener o crear contexto de conversación
            let conversationHistory = await this.getConversationHistory(request.conversationId);

            // 2. Crear mensaje del usuario
            const userMessage: Message = {
                id: uuidv4(),
                conversationId: request.conversationId,
                role: MessageRole.USER,
                content: request.message,
                type: request.messageType || MessageType.TEXT,
                timestamp: new Date(),
                metadata: request.metadata,
            };

            // 3. Agregar mensaje al historial
            conversationHistory.push(userMessage);

            // 4. Obtener provider LLM
            const llmProvider = LLMFactory.getDefaultProvider();

            // 5. Preparar herramientas disponibles
            const availableTools = ToolRegistry.getToolDefinitionsForLLM();

            // 6. Primera llamada al LLM
            let llmRequest: LLMRequest = {
                messages: this.limitContextMessages(conversationHistory),
                tools: availableTools,
                temperature: 0.7,
                maxTokens: 1024,
            };

            let llmResponse = await llmProvider.generateResponse(llmRequest);
            let assistantContent = llmResponse.content;
            let toolsUsed: string[] = [];

            // 7. Si el LLM quiere usar herramientas, ejecutarlas
            if (llmResponse.toolCalls && llmResponse.toolCalls.length > 0) {
                console.log(`🔧 LLM solicitó ${llmResponse.toolCalls.length} tool call(s)`);

                // Ejecutar cada tool call
                for (const toolCall of llmResponse.toolCalls) {
                    const toolResult = await ToolRegistry.executeTool(
                        toolCall.toolName,
                        toolCall.arguments,
                        {
                            userId: request.userId,
                            conversationId: request.conversationId,
                        }
                    );

                    toolsUsed.push(toolCall.toolName);

                    // Crear mensaje de tool result
                    const toolMessage: Message = {
                        id: uuidv4(),
                        conversationId: request.conversationId,
                        role: MessageRole.TOOL,
                        content: JSON.stringify(toolResult),
                        type: MessageType.TEXT,
                        timestamp: new Date(),
                        metadata: {
                            toolCall: toolCall,
                            toolResult: toolResult,
                        },
                    };

                    conversationHistory.push(toolMessage);
                }

                // Segunda llamada al LLM con los resultados de las herramientas
                llmRequest = {
                    messages: this.limitContextMessages(conversationHistory),
                    temperature: 0.7,
                    maxTokens: 1024,
                };

                llmResponse = await llmProvider.generateResponse(llmRequest);
                assistantContent = llmResponse.content;
            }

            // 8. Crear mensaje del asistente
            const assistantMessage: Message = {
                id: uuidv4(),
                conversationId: request.conversationId,
                role: MessageRole.ASSISTANT,
                content: assistantContent,
                type: MessageType.TEXT,
                timestamp: new Date(),
            };

            conversationHistory.push(assistantMessage);

            // 9. Guardar contexto actualizado
            await this.saveConversationHistory(request.conversationId, conversationHistory);

            // 10. Retornar respuesta
            return {
                conversationId: request.conversationId,
                message: assistantMessage,
                assistantResponse: assistantContent,
                toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
                timestamp: new Date(),
            };
        } catch (error) {
            console.error('❌ Error en orchestrator:', error);
            throw error;
        }
    }

    /**
     * Procesa imágenes (multimodal)
     */
    async processImage(
        conversationId: string,
        imageData: Buffer | string,
        prompt?: string
    ): Promise<string> {
        try {
            console.log(`🖼️ Procesando imagen para conversación: ${conversationId}`);

            const llmProvider = LLMFactory.getDefaultProvider();

            if (!llmProvider.processImage) {
                throw new Error('El provider actual no soporta procesamiento de imágenes');
            }

            const description = await llmProvider.processImage(imageData);

            // Si hay un prompt adicional, procesarlo con el contexto de la imagen
            if (prompt) {
                const response = await this.processMessage({
                    conversationId,
                    message: `${prompt}\n\nContexto de imagen: ${description}`,
                    messageType: MessageType.IMAGE,
                });
                return response.assistantResponse;
            }

            return description;
        } catch (error) {
            console.error('❌ Error procesando imagen:', error);
            throw error;
        }
    }

    /**
     * Obtiene el historial de conversación
     */
    async getConversationHistory(conversationId: string): Promise<Message[]> {
        try {
            const history = await getConversationContext(conversationId);
            return history || [];
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            return [];
        }
    }

    /**
     * Guarda el historial de conversación
     */
    async saveConversationHistory(conversationId: string, messages: Message[]): Promise<void> {
        try {
            await saveConversationContext(
                conversationId,
                messages,
                this.conversationTimeoutMinutes
            );
        } catch (error) {
            console.error('Error guardando historial:', error);
        }
    }

    /**
     * Elimina una conversación
     */
    async deleteConversation(conversationId: string): Promise<void> {
        try {
            await deleteConversationContext(conversationId);
            console.log(`🗑️ Conversación ${conversationId} eliminada`);
        } catch (error) {
            console.error('Error eliminando conversación:', error);
            throw error;
        }
    }

    /**
     * Limita el número de mensajes en el contexto
     */
    private limitContextMessages(messages: Message[]): Message[] {
        if (messages.length <= this.maxContextMessages) {
            return messages;
        }

        // Mantener los últimos N mensajes
        return messages.slice(-this.maxContextMessages);
    }

    /**
     * Obtiene estadísticas del orchestrator
     */
    getStats() {
        return {
            maxContextMessages: this.maxContextMessages,
            conversationTimeoutMinutes: this.conversationTimeoutMinutes,
            availableTools: ToolRegistry.getStats(),
            availableProviders: LLMFactory.listAvailableProviders(),
        };
    }
}

// Exportar instancia singleton
export const orchestratorService = new OrchestratorService();
