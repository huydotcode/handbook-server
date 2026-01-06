import axios from 'axios';
import { env } from '../common/config';

// Define global type augmentation for singleton
declare global {
    var eventBusInstance: EventBusService | undefined;
}

class EventBusService {
    private readonly realtimeUrl: string;
    private readonly secretKey: string;

    constructor() {
        this.realtimeUrl = env.REALTIME_SERVICE_URL;
        this.secretKey = env.INTERNAL_SECRET_KEY;
    }

    /**
     * Publish an event to a channel via HTTP
     * @param channel - Event channel name (e.g. 'message.created')
     * @param data - Event payload
     */
    async publish(channel: string, data: any): Promise<void> {
        // Fire and forget - do not await to avoid blocking API response
        // or await if we want to ensure delivery (usually safer to not block API for notification)
        // For reliability, we should log errors.
        this.sendEvent(channel, data).catch((err) => {
            console.error(`❌ Failed to send event ${channel}:`, err.message);
        });
    }

    private async sendEvent(channel: string, data: any) {
        try {
            await axios.post(
                `${this.realtimeUrl}/internal/events`,
                { channel, data },
                {
                    headers: {
                        'x-internal-secret': this.secretKey,
                        'Content-Type': 'application/json',
                    },
                    timeout: 2000,
                }
            );
            console.log(`📤 Event sent to Realtime Server: ${channel}`);
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Publish multiple events in batch
     */
    async publishBatch(
        events: Array<{ channel: string; data: any }>
    ): Promise<void> {
        // Iterate and send individually (could be optimized with a batch endpoint later)
        events.forEach(({ channel, data }) => {
            this.publish(channel, data);
        });
    }

    /**
     * Check connection (dummy)
     */
    getConnectionStatus(): boolean {
        return true;
    }

    /**
     * Disconnect (noop)
     */
    async disconnect(): Promise<void> {
        // No persistent connection to close
    }
}

/**
 * Singleton instance
 */
let instance = global.eventBusInstance;

if (!instance) {
    instance = new EventBusService();
    global.eventBusInstance = instance;
}

// Export as the same name to minimize refactoring in other files
export const redisPubSubService = instance;
