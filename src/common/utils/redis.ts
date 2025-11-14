import Redis from 'ioredis';
import { config } from './config';

const redis = new Redis({
    host: config.redisHost,
    port: config.redisPort,
    password: config.redisPassword,
});

export default redis;
