import Redis from 'ioredis';
import { env } from '../common/config';
import redis, { isRedisReady } from '../common/utils/redis';

// Define global type augmentation for Pub/Sub singleton
declare global {
    var redisPubSubInstance: RedisPubSubService | undefined;
}

class RedisPubSubService {
    constructor() {
        // No need to create a separate publisher connection
        // We use the shared redis instance imported from '../common/utils/redis'
    }

    /**
     * Publish an event to a channel
     * @param channel - Event channel name
     * @param data - Event payload (will be JSON stringified)
     */
    async publish(channel: string, data: any): Promise<void> {
        // Graceful degradation: Check if Redis is ready before attempting to publish
        if (!isRedisReady()) {
            console.warn(
                `⚠️ Skipped publishing to ${channel}: Redis not ready`
            );
            return;
        }

        try {
            const payload = JSON.stringify(data);
            await redis.publish(channel, payload);
            console.log(`📤 Published event to ${channel}:`, data);
        } catch (error) {
            // Log error but don't throw to prevent crashing the main flow
            console.error(`❌ Error publishing to ${channel}:`, error);
        }
    }

    /**
     * Publish multiple events in batch
     */
    async publishBatch(
        events: Array<{ channel: string; data: any }>
    ): Promise<void> {
        if (!isRedisReady()) {
            console.warn(`⚠️ Skipped batch publish: Redis not ready`);
            return;
        }

        const pipeline = redis.pipeline();

        for (const { channel, data } of events) {
            const payload = JSON.stringify(data);
            pipeline.publish(channel, payload);
        }

        try {
            await pipeline.exec();
            console.log(`📤 Published ${events.length} events in batch`);
        } catch (error) {
            console.error('❌ Error publishing batch:', error);
        }
    }

    /**
     * Check if publisher is connected
     */
    getConnectionStatus(): boolean {
        return isRedisReady();
    }

    /**
     * Close the publisher connection
     */
    async disconnect(): Promise<void> {
        // We do not disconnect here because the redis instance is shared
        console.log(
            'Redis Pub/Sub Publisher disconnect called (no-op for shared connection)'
        );
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
