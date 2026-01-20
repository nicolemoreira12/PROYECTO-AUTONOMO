import axios from 'axios';
import { MICROSERVICES } from '../api/microservices.config';

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
    private baseURL = MICROSERVICES.AI_ORCHESTRATOR;
    private conversationId: string | null = null;

    async startConversation(): Promise<string | null> {
        try {
            const response = await axios.post(`${this.baseURL}/api/ai/conversation/start`);
            this.conversationId = response.data.conversationId;
            return this.conversationId;
        } catch (error) {
            console.error('Error al iniciar conversación:', error);
            return null;
        }
    }

    async sendMessage(message: string): Promise<AIResponse> {
        try {
            if (!this.conversationId) {
                await this.startConversation();
            }

            const response = await axios.post(`${this.baseURL}/api/ai/chat`, {
                message,
                conversationId: this.conversationId,
            });

            return {
                message: response.data.message || response.data.response,
                conversationId: this.conversationId || undefined,
                suggestions: response.data.suggestions,
            };
        } catch (error: any) {
            console.error('Error al enviar mensaje a AI:', error);
            return {
                message: '',
                error: error.response?.data?.message || 'Error al comunicarse con el asistente IA',
            };
        }
    }

    async getProductRecommendations(preferences?: string[]): Promise<ProductRecommendation[]> {
        try {
            const response = await axios.post(`${this.baseURL}/api/ai/recommendations`, {
                preferences,
                conversationId: this.conversationId,
            });

            return response.data.recommendations || [];
        } catch (error) {
            console.error('Error al obtener recomendaciones:', error);
            return [];
        }
    }

    async analyzeProductSearch(query: string): Promise<any> {
        try {
            const response = await axios.post(`${this.baseURL}/api/ai/analyze-search`, {
                query,
            });

            return response.data;
        } catch (error) {
            console.error('Error al analizar búsqueda:', error);
            return null;
        }
    }

    async helpWithPurchase(productInfo: any): Promise<AIResponse> {
        try {
            const message = `Necesito ayuda con este producto: ${JSON.stringify(productInfo)}`;
            return await this.sendMessage(message);
        } catch (error: any) {
            return {
                message: '',
                error: 'Error al obtener ayuda del asistente',
            };
        }
    }

    resetConversation() {
        this.conversationId = null;
    }
}

export const aiService = new AIService();
