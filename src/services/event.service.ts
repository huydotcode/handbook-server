import { redisPubSubService } from './redis-pubsub.service';

// Import event channels from shared constants
const EVENT_CHANNELS = {
    MESSAGE_CREATED: 'message.created',
    MESSAGE_READ: 'message.read',
    MESSAGE_DELETED: 'message.deleted',
    MESSAGE_PINNED: 'message.pinned',
    MESSAGE_UNPINNED: 'message.unpinned',
    NOTIFICATION_SENT: 'notification.sent',
    USER_STATUS_CHANGED: 'user.status.changed',
    POST_LIKED: 'post.liked',
};

class EventService {
    /**
     * Publish message created event
     */
    async publishMessageCreated(data: {
        roomId: string;
        conversationId?: string;
        conversationTitle?: string;
        message: any;
    }): Promise<void> {
        await redisPubSubService.publish(EVENT_CHANNELS.MESSAGE_CREATED, data);
    }

    /**
     * Publish message read event
     */
    async publishMessageRead(data: {
        roomId: string;
        userId: string;
    }): Promise<void> {
        await redisPubSubService.publish(EVENT_CHANNELS.MESSAGE_READ, data);
    }

    /**
     * Publish message deleted event
     */
    async publishMessageDeleted(data: { message: any }): Promise<void> {
        await redisPubSubService.publish(EVENT_CHANNELS.MESSAGE_DELETED, data);
    }

    /**
     * Publish message pinned event
     */
    async publishMessagePinned(data: { message: any }): Promise<void> {
        await redisPubSubService.publish(EVENT_CHANNELS.MESSAGE_PINNED, data);
    }

    /**
     * Publish message unpinned event
     */
    async publishMessageUnpinned(data: { message: any }): Promise<void> {
        await redisPubSubService.publish(EVENT_CHANNELS.MESSAGE_UNPINNED, data);
    }

    /**
     * Publish notification sent event
     */
    async publishNotificationSent(data: { notification: any }): Promise<void> {
        await redisPubSubService.publish(
            EVENT_CHANNELS.NOTIFICATION_SENT,
            data
        );
    }

    /**
     * Publish user status changed event
     */
    async publishUserStatusChanged(data: {
        userId: string;
        isOnline: boolean;
    }): Promise<void> {
        await redisPubSubService.publish(
            EVENT_CHANNELS.USER_STATUS_CHANGED,
            data
        );
    }

    /**
     * Publish post liked event
     */
    async publishPostLiked(data: {
        postId: string;
        authorId: string;
        userId: string;
        notification?: any;
    }): Promise<void> {
        await redisPubSubService.publish(EVENT_CHANNELS.POST_LIKED, data);
    }
}

export const eventService = new EventService();
