import Redis from 'ioredis';
import { env } from '../config';

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

export default redis;
