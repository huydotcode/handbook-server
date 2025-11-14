import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const port = parseInt(process.env.PORT || '8080', 10);

/**
 * Validates required configuration values
 * @throws Error if required config is missing
 */
export function validateConfig(): void {
    const required = ['MONGODB_URI'];
    const missing: string[] = [];

    for (const key of required) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        );
    }

    if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid PORT: ${port}. Must be between 1 and 65535`);
    }
}

export const config = {
    mongodbUri: process.env.MONGODB_URI,
    redisHost: process.env.REDIS_HOST,
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
    redisPassword: process.env.REDIS_PASSWORD,
    port,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
};
