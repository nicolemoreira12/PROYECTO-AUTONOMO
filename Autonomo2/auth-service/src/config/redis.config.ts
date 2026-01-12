import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: RedisClientType | null = null;
let redisAvailable = true; // Flag para evitar reintentos infinitos

export const getRedisClient = async (): Promise<RedisClientType | null> => {
  // Si ya sabemos que Redis no está disponible, no intentar conectar
  if (!redisAvailable) {
    return null;
  }

  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        connectTimeout: 5000, // 5 segundos timeout
        reconnectStrategy: false, // No reintentar automáticamente
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      // Solo mostrar el error una vez
      if (redisAvailable) {
        console.warn('⚠️ Redis no disponible, usando fallback a base de datos para blacklist');
        redisAvailable = false;
      }
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis conectado correctamente');
      redisAvailable = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('⚠️ Redis no disponible, usando fallback a base de datos para blacklist');
    redisAvailable = false;
    redisClient = null;
    return null;
  }
};

// Funciones de utilidad para la blacklist
export const addToBlacklist = async (jti: string, expiresInSeconds: number): Promise<boolean> => {
  const client = await getRedisClient();
  if (client) {
    await client.setEx(`blacklist:${jti}`, expiresInSeconds, 'revoked');
    return true;
  }
  return false;
};

export const isBlacklisted = async (jti: string): Promise<boolean> => {
  const client = await getRedisClient();
  if (client) {
    const result = await client.get(`blacklist:${jti}`);
    return result === 'revoked';
  }
  return false;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('Redis desconectado');
  }
};
