import redis from '../common/utils/redis';

declare global {
    var eventBusInstance: EventBusService | undefined;
}

class EventBusService {
    /**
     * Publish an event to a channel via Redis Pub/Sub
     * @param channel - Event channel name (e.g. 'message.created')
     * @param data - Event payload
     */
    async publish(channel: string, data: any): Promise<void> {
        try {
            const message = JSON.stringify(data);
            await redis.publish(channel, message);
            console.log(`Event published to Redis: ${channel}`);
        } catch (error: any) {
            console.error(`Failed to publish event ${channel}:`, error.message);
        }
    }

    /**
     * Publish multiple events in batch
     */
    async publishBatch(
        events: Array<{ channel: string; data: any }>
    ): Promise<void> {
        events.forEach(({ channel, data }) => {
            this.publish(channel, data);
        });
    }

    /**
     * Check connection
     */
    getConnectionStatus(): boolean {
        return redis.status === 'ready';
    }

    /**
     * Disconnect (noop for singleton)
     */
    async disconnect(): Promise<void> {}
}

/**
 * Singleton instance
 */
let instance = global.eventBusInstance;

if (!instance) {
    instance = new EventBusService();
    global.eventBusInstance = instance;
}

export const redisPubSubService = instance;
