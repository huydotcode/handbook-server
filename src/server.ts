import app from './app';
import { env } from './common/config';
import {
    connectToMongo,
    disconnectFromMongo,
    isMongoConnected,
} from './common/utils/mongodb';
import redis from './common/utils/redis';
import { redisPubSubService } from './services/redis-pubsub.service';

let server: ReturnType<typeof app.listen> | null = null;

/**
 * Starts the Express server
 */
const startServer = async (): Promise<void> => {
    try {
        // Connect to MongoDB
        await connectToMongo();

        // Start the Express server
        server = app.listen(env.PORT, () => {
            console.log(
                `Server is running on port: ${env.PORT} (${env.NODE_ENV})`
            );
        });

        // Handle server errors
        server.on('error', (error: NodeJS.ErrnoException) => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const bind =
                typeof env.PORT === 'string'
                    ? `Pipe ${env.PORT}`
                    : `Port ${env.PORT}`;

            switch (error.code) {
                case 'EACCES':
                    console.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                case 'EADDRINUSE':
                    console.error(`${bind} is already in use`);
                    process.exit(1);
                default:
                    throw error;
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

/**
 * Gracefully shuts down the server
 */
const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    if (server) {
        server.close(async () => {
            console.log('HTTP server closed');

            try {
                // Disconnect from MongoDB
                if (isMongoConnected()) {
                    await disconnectFromMongo();
                }

                // Disconnect from Redis
                try {
                    await redis.quit();
                    console.log('Redis client disconnected');
                } catch (redisError) {
                    console.warn(
                        'Redis client disconnect warning:',
                        redisError
                    );
                }

                // Disconnect from Redis Pub/Sub
                try {
                    await redisPubSubService.disconnect();
                    console.log('Redis Pub/Sub disconnected');
                } catch (pubsubError) {
                    console.warn(
                        'Redis Pub/Sub disconnect warning:',
                        pubsubError
                    );
                }

                console.log('Graceful shutdown completed');
                process.exit(0);
            } catch (error) {
                console.error('Error during shutdown:', error);
                process.exit(1);
            }
        });

        // Force close after 10 seconds
        setTimeout(() => {
            console.error(
                'Forced shutdown after timeout. Some connections may not have closed properly.'
            );
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
});

// Start the server
startServer().catch((error) => {
    console.error('Fatal error starting server:', error);
    process.exit(1);
});
