import Redis from 'ioredis';
import { env } from '../common/config';
import redis from '../common/utils/redis';

// Define global type augmentation for Pub/Sub singleton
declare global {
    var redisPubSubInstance: RedisPubSubService | undefined;
}

class RedisPubSubService {
    private publisher: Redis;
    private isConnected: boolean = false;

    constructor() {
        // Use duplicate() to create publisher from existing connection
        // This reuses the connection pool instead of creating a new one
        // redis is guaranteed to be non-undefined here since it's a singleton
        this.publisher = redis.duplicate({
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
            // Lazy connect: only establish connection when first publish() is called
            // This prevents unnecessary connections on cold start if no events are published
            lazyConnect: true,
        });
        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.publisher.on('connect', () => {
            console.log('✅ Redis Pub/Sub Publisher connected');
            this.isConnected = true;
        });

        this.publisher.on('error', (err) => {
            console.error('❌ Redis Pub/Sub Publisher error:', err);
            this.isConnected = false;
        });

        this.publisher.on('close', () => {
            console.log('⚠️ Redis Pub/Sub Publisher connection closed');
            this.isConnected = false;
        });
    }

    /**
     * Publish an event to a channel
     * @param channel - Event channel name
     * @param data - Event payload (will be JSON stringified)
     */
    async publish(channel: string, data: any): Promise<void> {
        try {
            // Auto-connect if lazyConnect is enabled and not yet connected
            if (!this.publisher.status || this.publisher.status === 'close') {
                await this.publisher.connect();
            }

            const payload = JSON.stringify(data);
            await this.publisher.publish(channel, payload);
            console.log(`📤 Published event to ${channel}:`, data);
        } catch (error) {
            console.error(`❌ Error publishing to ${channel}:`, error);
            throw error;
        }
    }

    /**
     * Publish multiple events in batch
     */
    async publishBatch(
        events: Array<{ channel: string; data: any }>
    ): Promise<void> {
        const pipeline = this.publisher.pipeline();

        for (const { channel, data } of events) {
            const payload = JSON.stringify(data);
            pipeline.publish(channel, payload);
        }

        try {
            await pipeline.exec();
            console.log(`📤 Published ${events.length} events in batch`);
        } catch (error) {
            console.error('❌ Error publishing batch:', error);
            throw error;
        }
    }

    /**
     * Check if publisher is connected
     */
    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    /**
     * Close the publisher connection
     */
    async disconnect(): Promise<void> {
        await this.publisher.quit();
        console.log('Redis Pub/Sub Publisher disconnected');
    }
}

/**
 * Singleton Pub/Sub service instance.
 * Reuses publisher connection across hot reloads in development.
 */
let redisPubSubServiceInstance = global.redisPubSubInstance;

if (!redisPubSubServiceInstance) {
    redisPubSubServiceInstance = new RedisPubSubService();
    global.redisPubSubInstance = redisPubSubServiceInstance;
}

export const redisPubSubService = redisPubSubServiceInstance;
