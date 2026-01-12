import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { getRedisClient, closeRedisConnection } from './config/redis.config';
import { authRoutes } from './routes';
import { generalRateLimiter } from './middlewares';
import { authService } from './services/auth.service';

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// ==================== MIDDLEWARES ====================

// CORS - Permitir peticiones de otros orígenes
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting general
app.use(generalRateLimiter);

// Trust proxy (para obtener IP real detrás de un reverse proxy)
app.set('trust proxy', 1);

// ==================== RUTAS ====================

// Ruta de salud
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rutas de autenticación
app.use('/auth', authRoutes);

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
    // Inicializar base de datos
    await initializeDatabase();

    // Intentar conectar a Redis (opcional)
    await getRedisClient();

    // Programar limpieza de tokens expirados (cada hora)
    setInterval(async () => {
      try {
        await authService.cleanupExpiredTokens();
      } catch (error) {
        console.error('Error en limpieza de tokens:', error);
      }
    }, 60 * 60 * 1000); // 1 hora

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('================================================');
      console.log(`🚀 Auth Service iniciado en el puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🔐 Endpoints disponibles:`);
      console.log(`   POST /auth/register  - Registrar usuario`);
      console.log(`   POST /auth/login     - Iniciar sesión`);
      console.log(`   POST /auth/logout    - Cerrar sesión`);
      console.log(`   POST /auth/refresh   - Renovar tokens`);
      console.log(`   GET  /auth/me        - Obtener usuario actual`);
      console.log(`   GET  /auth/validate  - Validar token (interno)`);
      console.log(`   GET  /health         - Estado del servicio`);
      console.log('================================================');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// ==================== MANEJO DE SEÑALES ====================

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} recibido. Cerrando servidor...`);
  try {
    await closeRedisConnection();
    console.log('Conexiones cerradas correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al cerrar conexiones:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Iniciar servidor
startServer();

export default app;
