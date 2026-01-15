import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
const chatController = new ChatController();

// Enviar mensaje de chat
router.post('/message', chatController.sendMessage.bind(chatController));

// Obtener historial de conversación
router.get('/history/:conversationId', chatController.getHistory.bind(chatController));

// Crear nueva conversación
router.post('/conversation', chatController.createConversation.bind(chatController));

// Eliminar conversación
router.delete('/conversation/:conversationId', chatController.deleteConversation.bind(chatController));

// Obtener estadísticas
router.get('/stats', chatController.getStats.bind(chatController));

export { router as chatRoutes };
