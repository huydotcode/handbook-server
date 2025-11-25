import { Types } from 'mongoose';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import {
    ENotificationType,
    INotificationModel,
} from '../models/notification.model';
import { NotificationRepository } from '../repositories/notification.repository';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from './user.service';
import { BaseService } from './base.service';
import { PaginationResult } from '../common/types/base';

/**
 * Service responsible for notification logic.
 */
export class NotificationService extends BaseService<INotificationModel> {
    private notificationRepository: NotificationRepository;
    private userService: UserService;

    constructor() {
        const repository = new NotificationRepository();
        super(repository);
        this.notificationRepository = repository;
        this.userService = new UserService();
    }

    /**
     * Create a new notification
     * @param data - Notification data
     * @param userId - User ID creating the notification
     * @returns Created notification
     */
    async createNotification(data: any, userId: string) {
        // Validate required fields (sender is set automatically from userId)
        this.validateRequiredFields(data, ['receiver', 'type']);

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

    /**
     * Get notification by ID
     * @param notificationId - Notification ID
     * @returns Notification
     */
    async getNotificationById(notificationId: string) {
        this.validateId(notificationId, 'Notification ID');
        return await this.getByIdOrThrow(notificationId);
    }

    /**
     * Send friend request (create request notification)
     * @param senderId - Sender ID
     * @param receiverId - Receiver ID
     * @returns Created notification
     */
    async sendFriendRequest(senderId: string, receiverId: string) {
        this.validateId(senderId, 'Sender ID');
        this.validateId(receiverId, 'Receiver ID');

        // Check if user is trying to send request to themselves
        if (senderId === receiverId) {
            throw new AppError(
                'Cannot send friend request to yourself',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Check if users are already friends
        const sender = await this.userService.getByIdOrThrow(senderId);
        const senderFriends = (sender.friends || []).map((f) =>
            typeof f === 'string' ? f : f.toString()
        );
        if (senderFriends.includes(receiverId)) {
            throw new AppError(
                'Users are already friends',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Check if request already exists
        const existingRequest = await this.notificationRepository.findOne({
            sender: senderId,
            receiver: receiverId,
            type: ENotificationType.REQUEST_ADD_FRIEND,
            isDeleted: false,
        });

        if (existingRequest) {
            throw new AppError(
                'Friend request already sent',
                HTTP_STATUS.CONFLICT
            );
        }

        // Create friend request notification
        return await this.create(
            {
                sender: new Types.ObjectId(senderId),
                receiver: new Types.ObjectId(receiverId),
                type: ENotificationType.REQUEST_ADD_FRIEND,
                isRead: false,
                isDeleted: false,
            },
            senderId
        );
    }

    /**
     * Accept friend request
     * @param notificationId - Notification ID
     * @param userId - User ID accepting the request
     * @returns Updated notification and friendship status
     */
    async acceptFriendRequest(notificationId: string, userId: string) {
        this.validateId(notificationId, 'Notification ID');
        this.validateId(userId, 'User ID');

        // Get notification
        const notification = await this.getByIdOrThrow(notificationId);

        // Verify notification type
        if (notification.type !== ENotificationType.REQUEST_ADD_FRIEND) {
            throw new AppError(
                'Notification is not a friend request',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Verify user is the receiver
        const receiverId =
            typeof notification.receiver === 'string'
                ? notification.receiver
                : notification.receiver.toString();
        if (receiverId !== userId) {
            throw new AppError(
                'You are not authorized to accept this request',
                HTTP_STATUS.FORBIDDEN
            );
        }

        const senderId =
            typeof notification.sender === 'string'
                ? notification.sender
                : notification.sender.toString();

        // Verify users exist
        await this.userService.getByIdOrThrow(senderId);
        await this.userService.getByIdOrThrow(receiverId);

        // Add to friends lists using $addToSet to avoid duplicates
        const userRepository = new UserRepository();

        await userRepository.update(senderId, {
            $addToSet: { friends: new Types.ObjectId(receiverId) },
        });
        await userRepository.update(receiverId, {
            $addToSet: { friends: new Types.ObjectId(senderId) },
        });

        // Create accept notification
        await this.create(
            {
                sender: new Types.ObjectId(receiverId),
                receiver: new Types.ObjectId(senderId),
                type: ENotificationType.ACCEPT_FRIEND_REQUEST,
                isRead: false,
                isDeleted: false,
            },
            userId
        );

        // Delete/update original request notification
        await this.update(
            notificationId,
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            userId
        );

        return {
            success: true,
            notification: await this.getById(notificationId),
        };
    }

    /**
     * Decline friend request
     * @param notificationId - Notification ID
     * @param userId - User ID declining the request
     * @returns Updated notification
     */
    async declineFriendRequest(notificationId: string, userId: string) {
        this.validateId(notificationId, 'Notification ID');
        this.validateId(userId, 'User ID');

        // Get notification
        const notification = await this.getByIdOrThrow(notificationId);

        // Verify notification type
        if (notification.type !== ENotificationType.REQUEST_ADD_FRIEND) {
            throw new AppError(
                'Notification is not a friend request',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Verify user is the receiver
        const receiverId =
            typeof notification.receiver === 'string'
                ? notification.receiver
                : notification.receiver.toString();
        if (receiverId !== userId) {
            throw new AppError(
                'You are not authorized to decline this request',
                HTTP_STATUS.FORBIDDEN
            );
        }

        // Create reject notification (optional)
        const senderId =
            typeof notification.sender === 'string'
                ? notification.sender
                : notification.sender.toString();

        await this.create(
            {
                sender: new Types.ObjectId(receiverId),
                receiver: new Types.ObjectId(senderId),
                type: ENotificationType.REJECT_FRIEND_REQUEST,
                isRead: false,
                isDeleted: false,
            },
            userId
        );

        // Delete original request notification
        await this.update(
            notificationId,
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            userId
        );

        return {
            success: true,
            notification: await this.getById(notificationId),
        };
    }

    /**
     * Delete notification by users (sender and receiver)
     * @param senderId - Sender ID
     * @param receiverId - Receiver ID
     * @param userId - User ID performing the action
     * @returns Update result
     */
    async deleteNotificationByUsers(
        senderId: string,
        receiverId: string,
        userId: string
    ) {
        this.validateId(senderId, 'Sender ID');
        this.validateId(receiverId, 'Receiver ID');

        // Verify user is either sender or receiver
        if (userId !== senderId && userId !== receiverId) {
            throw new AppError(
                'You are not authorized to delete this notification',
                HTTP_STATUS.FORBIDDEN
            );
        }

        return await this.notificationRepository.updateMany(
            {
                sender: senderId,
                receiver: receiverId,
                isDeleted: false,
            },
            {
                isDeleted: true,
                deletedAt: new Date(),
            }
        );
    }
}
