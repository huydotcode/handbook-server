import Redis from 'ioredis';
import { env } from '../config';

// Define global type augmentation for Redis singleton
declare global {
    var redisClient: Redis | undefined;
}

/**
 * Singleton Redis client instance.
 * Reuses connection across hot reloads in development and across multiple workers.
 */
const getRedisClient = (): Redis => {
    if (global.redisClient) {
        return global.redisClient;
    }

    const redis = new Redis({
        host: env.REDIS_HOST || 'localhost',
        port: Number(env.REDIS_PORT) || 6379,
        password: env.REDIS_PASSWORD || '',
        // Connection pooling settings
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
                return true;
            }
            return false;
        },
        // Keep-alive settings
        keepAlive: 30000,
        enableReadyCheck: true,
        enableOfflineQueue: true,
        // Limit connections
        lazyConnect: false,
    });

    redis.on('error', (err) => {
        console.error('❌ Redis Client error:', err);
    });

    redis.on('connect', () => {
        console.log('✅ Redis Client connected');
    });

    // Cache in global scope to prevent new connections on hot reload
    global.redisClient = redis;
    return redis;
};

const redis = getRedisClient();

export default redis;
