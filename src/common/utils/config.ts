import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const port = process.env.PORT || 8080;

export const config = {
    mongodbUri: process.env.MONGODB_URI,
    redisHost: process.env.REDIS_HOST,
    redisPort: parseInt(process.env.REDIS_PORT || '6379'),
    redisPassword: process.env.REDIS_PASSWORD,
    port,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};
