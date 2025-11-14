import { INotificationModel } from '../models/notification.model';
import { NotificationRepository } from '../repositories/notification.repository';
import { BaseService } from './base.service';
import { PaginationResult } from '../common/types/base';

/**
 * Service responsible for notification logic.
 */
export class NotificationService extends BaseService<INotificationModel> {
    private notificationRepository: NotificationRepository;

    constructor() {
        const repository = new NotificationRepository();
        super(repository);
        this.notificationRepository = repository;
    }

    /**
     * Create a new notification
     * @param data - Notification data
     * @param userId - User ID creating the notification
     * @returns Created notification
     */
    async createNotification(data: any, userId: string) {
        // Validate required fields
        this.validateRequiredFields(data, ['sender', 'receiver', 'type']);

        // Set sender from userId
        data.sender = userId;

        // Set default values
        if (data.isRead === undefined) {
            data.isRead = false;
        }
        if (data.isDeleted === undefined) {
            data.isDeleted = false;
        }

        return await this.create(data, userId);
    }

    /**
     * Get notifications by receiver
     * @param receiverId - Receiver ID
     * @returns Array of notifications
     */
    async getNotificationsByReceiver(receiverId: string) {
        this.validateId(receiverId, 'Receiver ID');
        return await this.notificationRepository.findManyWithSort(
            {
                receiver: receiverId,
                isDeleted: false,
            },
            { createdAt: -1 }
        );
    }

    /**
     * Get notifications with pagination.
     */
    async getNotificationsWithPagination(
        receiverId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<INotificationModel>> {
        this.validateId(receiverId, 'Receiver ID');
        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        return await this.notificationRepository.findPaginatedByReceiver(
            receiverId,
            currentPage,
            currentPageSize
        );
    }

    /**
     * Get request notifications (sent by user) with pagination.
     */
    async getRequestsBySender(
        senderId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<INotificationModel>> {
        this.validateId(senderId, 'Sender ID');
        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        return await this.notificationRepository.findPaginatedBySender(
            senderId,
            currentPage,
            currentPageSize
        );
    }

    /**
     * Get unread notifications by receiver
     * @param receiverId - Receiver ID
     * @returns Array of unread notifications
     */
    async getUnreadNotifications(receiverId: string) {
        this.validateId(receiverId, 'Receiver ID');
        return await this.notificationRepository.findManyWithSort(
            {
                receiver: receiverId,
                isRead: false,
                isDeleted: false,
            },
            { createdAt: -1 }
        );
    }

    /**
     * Mark notification as read
     * @param notificationId - Notification ID
     * @param userId - User ID
     * @returns Updated notification
     */
    async markAsRead(notificationId: string, userId: string) {
        this.validateId(notificationId);

        return await this.update(notificationId, { isRead: true }, userId);
    }

    /**
     * Mark all notifications as read for a user
     * @param receiverId - Receiver ID
     * @returns Update result
     */
    async markAllAsRead(receiverId: string) {
        this.validateId(receiverId, 'Receiver ID');

        return await this.notificationRepository.updateMany(
            {
                receiver: receiverId,
                isRead: false,
            },
            { isRead: true }
        );
    }

    /**
     * Soft delete notification
     * @param notificationId - Notification ID
     * @param userId - User ID
     * @returns Updated notification
     */
    async deleteNotification(notificationId: string, userId: string) {
        this.validateId(notificationId);

        return await this.update(
            notificationId,
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            userId
        );
    }

    /**
     * Delete all notifications for a user
     * @param receiverId - Receiver ID
     * @returns Update result
     */
    async deleteAllNotifications(receiverId: string) {
        this.validateId(receiverId, 'Receiver ID');

        return await this.notificationRepository.updateMany(
            { receiver: receiverId },
            {
                isDeleted: true,
                deletedAt: new Date(),
            }
        );
    }

    private normalizePagination(page: number, pageSize: number) {
        return {
            currentPage: Math.max(1, page || 1),
            currentPageSize: Math.max(1, pageSize || 10),
        };
    }
}
