import Redis from 'ioredis';
import { env } from '../config';

const redis = new Redis({
    host: env.REDIS_HOST || 'localhost',
    port: Number(env.REDIS_PORT) || 6379,
    password: env.REDIS_PASSWORD || '',
});

export default redis;
