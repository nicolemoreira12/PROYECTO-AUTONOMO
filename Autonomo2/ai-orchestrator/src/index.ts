import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { getRedisClient } from './config/redis.config';
import { chatRoutes } from './routes/chat.routes';
import { toolRoutes } from './routes/tool.routes';
import { orchestratorService } from './services';
import { MessageType } from './types';

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 6000;

// Crear servidor HTTP para Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
    },
});

// ==================== MIDDLEWARES ====================

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== RUTAS ====================

// Ruta de salud
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        service: 'ai-orchestrator',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        llmProvider: process.env.DEFAULT_LLM_PROVIDER || 'gemini',
    });
});

// Rutas de chat
app.use('/api/chat', chatRoutes);

// Rutas de herramientas MCP
app.use('/api/tools', toolRoutes);

// Servir interfaz de chat
app.get('/chat', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../views/chat.html'));
});

// ==================== SOCKET.IO ====================

io.on('connection', (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id}`);

    socket.on('chat:message', async (data) => {
        try {
            const { conversationId, message, userId } = data;

            // Procesar con orchestrator
            const response = await orchestratorService.processMessage({
                conversationId: conversationId || `ws-${socket.id}`,
                message,
                messageType: MessageType.TEXT,
                userId,
            });

            socket.emit('chat:response', {
                conversationId: response.conversationId,
                message: response.assistantResponse,
                toolsUsed: response.toolsUsed,
                timestamp: response.timestamp,
            });
        } catch (error) {
            console.error('Error procesando mensaje:', error);
            socket.emit('chat:error', { error: 'Error procesando mensaje' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
});

// ==================== MANEJO DE ERRORES ====================

// Ruta no encontrada
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path,
    });
});

// Manejador de errores global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// ==================== INICIALIZACIÓN ====================

const startServer = async () => {
    try {
        // Conectar a Redis (opcional)
        try {
            await getRedisClient();
            console.log('✅ Redis conectado correctamente');
        } catch (error) {
            console.warn('⚠️  Redis no disponible, continuando sin caché de contexto');
        }

        // Iniciar servidor
        httpServer.listen(PORT, () => {
            console.log('================================================');
            console.log(`🤖 AI Orchestrator iniciado en el puerto ${PORT}`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🧠 LLM Provider: ${process.env.DEFAULT_LLM_PROVIDER || 'gemini'}`);
            console.log(`🔌 WebSocket habilitado para chat en tiempo real`);
            console.log(`📞 Endpoints disponibles:`);
            console.log(`   POST /api/chat/message      - Enviar mensaje de chat`);
            console.log(`   GET  /api/chat/history/:id  - Obtener historial`);
            console.log(`   GET  /api/tools             - Listar herramientas MCP`);
            console.log(`   GET  /health                - Estado del servicio`);
            console.log('================================================');
        });
    } catch (error) {
        console.error('❌ Error fatal al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recibido, cerrando servidor...');
    httpServer.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

startServer();
