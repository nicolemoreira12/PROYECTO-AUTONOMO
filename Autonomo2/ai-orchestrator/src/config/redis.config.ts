import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
    if (redisClient && redisClient.isOpen) {
        return redisClient;
    }

    const config = {
        socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        password: process.env.REDIS_PASSWORD || undefined,
    };

    redisClient = createClient(config);

    redisClient.on('error', (err: Error) => {
        console.error('❌ Error de Redis:', err);
    });

    redisClient.on('connect', () => {
        console.log('✅ Conectado a Redis');
    });

    await redisClient.connect();
    return redisClient;
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
        const key = `conversation:${conversationId}`;
        await client.setEx(key, ttlMinutes * 60, JSON.stringify(messages));
    } catch (error) {
        console.error('Error guardando contexto:', error);
        throw error;
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
        const key = `conversation:${conversationId}`;
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error obteniendo contexto:', error);
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
        const key = `conversation:${conversationId}`;
        await client.del(key);
    } catch (error) {
        console.error('Error eliminando contexto:', error);
    }
};
