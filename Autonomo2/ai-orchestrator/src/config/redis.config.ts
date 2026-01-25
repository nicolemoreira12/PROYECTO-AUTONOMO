import { createClient, RedisClientType } from 'redis';

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
        const config = {
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                connectTimeout: 5000,
                reconnectStrategy: false, // No reintentar automáticamente
            },
            password: process.env.REDIS_PASSWORD || undefined,
        };

        redisClient = createClient(config);

        redisClient.on('error', (err: Error) => {
            if (redisAvailable) {
                console.warn('⚠️ Redis no disponible. El sistema funcionará sin caché.');
                redisAvailable = false;
            }
        });

        redisClient.on('connect', () => {
            console.log('✅ Conectado a Redis');
            redisAvailable = true;
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        console.warn('⚠️ Redis no disponible. El sistema funcionará sin caché.');
        redisAvailable = false;
        redisClient = null;
        return null;
    }
};

export const closeRedisConnection = async (): Promise<void> => {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        redisClient = null;
        console.log('✅ Conexión a Redis cerrada');
    }
};

/**
 * Guarda el contexto de conversación en Redis
 */
export const saveConversationContext = async (
    conversationId: string,
    messages: any[],
    ttlMinutes: number = 30
): Promise<void> => {
    try {
        const client = await getRedisClient();
        if (!client) {
            // Redis no disponible, solo logear sin fallar
            console.log('ℹ️ Redis no disponible, no se guardará el contexto en caché');
            return;
        }
        const key = `conversation:${conversationId}`;
        await client.setEx(key, ttlMinutes * 60, JSON.stringify(messages));
    } catch (error) {
        console.warn('⚠️ Error guardando contexto en Redis (no crítico):', error instanceof Error ? error.message : error);
        // No lanzar el error, solo advertir
    }
};

/**
 * Obtiene el contexto de conversación desde Redis
 */
export const getConversationContext = async (
    conversationId: string
): Promise<any[] | null> => {
    try {
        const client = await getRedisClient();
        if (!client) {
            return null;
        }
        const key = `conversation:${conversationId}`;
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn('⚠️ Error obteniendo contexto de Redis:', error instanceof Error ? error.message : error);
        return null;
    }
};

/**
 * Elimina el contexto de conversación
 */
export const deleteConversationContext = async (
    conversationId: string
): Promise<void> => {
    try {
        const client = await getRedisClient();
        if (!client) {
            return;
        }
        const key = `conversation:${conversationId}`;
        await client.del(key);
    } catch (error) {
        console.warn('⚠️ Error eliminando contexto de Redis:', error instanceof Error ? error.message : error);
        // No crítico
    }
};
