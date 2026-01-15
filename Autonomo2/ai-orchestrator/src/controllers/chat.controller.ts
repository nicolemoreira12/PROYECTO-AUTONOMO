import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { orchestratorService } from '../services';
import { MessageType } from '../types';

export class ChatController {
    async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { conversationId, message, messageType = 'text', userId } = req.body;

            if (!message) {
                res.status(400).json({
                    success: false,
                    error: 'El mensaje es requerido',
                });
                return;
            }

            const finalConversationId = conversationId || uuidv4();

            const response = await orchestratorService.processMessage({
                conversationId: finalConversationId,
                message,
                messageType: messageType as MessageType,
                userId,
            });

            res.status(200).json({
                success: true,
                conversationId: response.conversationId,
                response: response.assistantResponse,
                toolsUsed: response.toolsUsed,
                timestamp: response.timestamp,
            });
        } catch (error) {
            console.error('Error en sendMessage:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const { conversationId } = req.params;
            const history = await orchestratorService.getConversationHistory(conversationId);

            res.status(200).json({
                success: true,
                conversationId,
                messages: history,
                total: history.length,
            });
        } catch (error) {
            console.error('Error en getHistory:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    async createConversation(req: Request, res: Response): Promise<void> {
        try {
            const conversationId = uuidv4();

            res.status(201).json({
                success: true,
                conversationId,
                createdAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error en createConversation:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    async deleteConversation(req: Request, res: Response): Promise<void> {
        try {
            const { conversationId } = req.params;
            await orchestratorService.deleteConversation(conversationId);

            res.status(200).json({
                success: true,
                message: 'Conversación eliminada',
                conversationId,
            });
        } catch (error) {
            console.error('Error en deleteConversation:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    async getStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = orchestratorService.getStats();

            res.status(200).json({
                success: true,
                stats,
            });
        } catch (error) {
            console.error('Error en getStats:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }
}
