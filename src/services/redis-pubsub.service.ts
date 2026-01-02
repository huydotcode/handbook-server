import Redis from 'ioredis';
import { env } from '../common/config';

class RedisPubSubService {
    private publisher: Redis;
    private isConnected: boolean = false;

    constructor() {
        const redisUrl = env.REDIS_URL;

        this.publisher = new Redis(redisUrl);
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
        if (!this.isConnected) {
            console.warn(`Redis not connected, skipping publish to ${channel}`);
            return;
        }

        try {
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

export const redisPubSubService = new RedisPubSubService();
