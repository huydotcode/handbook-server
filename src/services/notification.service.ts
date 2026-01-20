import { Types } from 'mongoose';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError } from '../common/errors/app.error';
import { PaginationResult } from '../common/types/base';
import { POPULATE_USER } from '../common/utils';
import {
    ENotificationType,
    INotificationModel,
} from '../models/notification.model';
import { NotificationRepository } from '../repositories/notification.repository';
import { BaseService } from './base.service';
import { ConversationService } from './conversation.service';
import { eventService } from './event.service';
import { FriendshipService } from './friendship.service';
import { UserService } from './user.service';

/**
 * Service responsible for notification logic.
 */
export class NotificationService extends BaseService<INotificationModel> {
    private notificationRepository: NotificationRepository;
    private userService: UserService;
    private conversationService: ConversationService;
    private friendshipService: FriendshipService;

    constructor() {
        const repository = new NotificationRepository();
        super(repository);
        this.notificationRepository = repository;
        this.userService = new UserService();
        this.conversationService = new ConversationService();
        this.friendshipService = new FriendshipService();
    }

    /**
     * Override create to auto-emit notification events
     * @param data - Notification data
     * @param userId - User ID creating the notification
     * @param populateOptions - Optional populate options
     * @returns Created notification
     */
    async create(
        data: Partial<INotificationModel>,
        userId: string,
        populateOptions?: any
    ): Promise<INotificationModel> {
        const notification = await super.create(data, userId, populateOptions);

        // Auto emit notification event for all notifications
        try {
            await eventService.publishNotificationSent({ notification });
        } catch (error) {
            console.error('Error publishing notification event:', error);
        }

        return notification;
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
        const alreadyFriends = await this.friendshipService.areFriends(
            senderId,
            receiverId
        );
        if (alreadyFriends) {
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

        // Create friend request notification (auto-emits via create method)
        return await this.create(
            {
                sender: new Types.ObjectId(senderId),
                receiver: new Types.ObjectId(receiverId),
                type: ENotificationType.REQUEST_ADD_FRIEND,
                isRead: false,
                isDeleted: false,
            },
            senderId,
            {
                path: 'sender',
                select: POPULATE_USER,
            }
        );
    }

    /**
     * Create follow user notification
     * @param senderId - Sender ID (user who follows)
     * @param receiverId - Receiver ID (user being followed)
     * @returns Created notification
     */
    async createFollowUserNotification(senderId: string, receiverId: string) {
        this.validateId(senderId, 'Sender ID');
        this.validateId(receiverId, 'Receiver ID');

        // Check if user is trying to follow themselves
        if (senderId === receiverId) {
            throw new AppError(
                'Cannot create follow notification for yourself',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Check if notification already exists
        const existingNotification = await this.notificationRepository.findOne({
            sender: senderId,
            receiver: receiverId,
            type: ENotificationType.FOLLOW_USER,
            isDeleted: false,
        });

        if (existingNotification) {
            // Return existing notification instead of throwing error
            // User might follow/unfollow multiple times
            return existingNotification;
        }

        // Create follow notification
        return await this.create(
            {
                sender: new Types.ObjectId(senderId),
                receiver: new Types.ObjectId(receiverId),
                type: ENotificationType.FOLLOW_USER,
                isRead: false,
                isDeleted: false,
            },
            senderId,
            {
                path: 'sender',
                select: POPULATE_USER,
            }
        );
    }

    /**
     * Create new post notification for a follower
     * @param senderId - Sender ID (post author)
     * @param receiverId - Receiver ID (follower)
     * @param postId - Post ID
     * @returns Created notification
     */
    async createPostNotification(
        senderId: string,
        receiverId: string,
        postId: string
    ) {
        this.validateId(senderId, 'Sender ID');
        this.validateId(receiverId, 'Receiver ID');
        this.validateId(postId, 'Post ID');

        if (senderId === receiverId) {
            return null;
        }

        return await this.create(
            {
                sender: new Types.ObjectId(senderId),
                receiver: new Types.ObjectId(receiverId),
                type: ENotificationType.CREATE_POST,
                extra: {
                    postId: new Types.ObjectId(postId),
                },
                isRead: false,
                isDeleted: false,
            },
            senderId,
            {
                path: 'sender',
                select: POPULATE_USER,
            }
        );
    }

    /**
     * Create comment notification for post author
     * @param senderId - Sender ID (commenter)
     * @param receiverId - Receiver ID (post author)
     * @param postId - Post ID
     * @param commentId - Comment ID
     * @returns Created notification
     */
    async createCommentNotification(
        senderId: string,
        receiverId: string,
        postId: string,
        commentId: string
    ) {
        this.validateId(senderId, 'Sender ID');
        this.validateId(receiverId, 'Receiver ID');
        this.validateId(postId, 'Post ID');
        this.validateId(commentId, 'Comment ID');

        if (senderId === receiverId) {
            return null;
        }

        return await this.create(
            {
                sender: new Types.ObjectId(senderId),
                receiver: new Types.ObjectId(receiverId),
                type: ENotificationType.COMMENT_POST,
                extra: {
                    postId: new Types.ObjectId(postId),
                    commentId: new Types.ObjectId(commentId),
                },
                isRead: false,
                isDeleted: false,
            },
            senderId,
            {
                path: 'sender',
                select: POPULATE_USER,
            }
        );
    }

    /**
     * Create reply comment notification for parent comment author
     * @param senderId - Sender ID (replier)
     * @param receiverId - Receiver ID (parent comment author)
     * @param postId - Post ID
     * @param parentCommentId - Parent Comment ID
     * @param replyCommentId - Reply Comment ID
     * @returns Created notification
     */
    async createReplyCommentNotification(
        senderId: string,
        receiverId: string,
        postId: string,
        parentCommentId: string,
        replyCommentId: string
    ) {
        this.validateId(senderId, 'Sender ID');
        this.validateId(receiverId, 'Receiver ID');
        this.validateId(postId, 'Post ID');
        this.validateId(parentCommentId, 'Parent Comment ID');
        this.validateId(replyCommentId, 'Reply Comment ID');

        if (senderId === receiverId) {
            return null;
        }

        return await this.create(
            {
                sender: new Types.ObjectId(senderId),
                receiver: new Types.ObjectId(receiverId),
                type: ENotificationType.REPLY_COMMENT,
                extra: {
                    postId: new Types.ObjectId(postId),
                    commentId: new Types.ObjectId(replyCommentId),
                    parentCommentId: new Types.ObjectId(parentCommentId),
                },
                isRead: false,
                isDeleted: false,
            },
            senderId,
            {
                path: 'sender',
                select: POPULATE_USER,
            }
        );
    }

    /**
     * Create like comment notification for comment author
     * @param senderId - Sender ID (liker)
     * @param receiverId - Receiver ID (comment author)
     * @param postId - Post ID
     * @param commentId - Comment ID
     * @returns Created notification
     */
    async createLikeCommentNotification(
        senderId: string,
        receiverId: string,
        postId: string,
        commentId: string
    ) {
        this.validateId(senderId, 'Sender ID');
        this.validateId(receiverId, 'Receiver ID');
        this.validateId(postId, 'Post ID');
        this.validateId(commentId, 'Comment ID');

        // Check if user is liking their own comment
        if (senderId === receiverId) {
            return null;
        }

        // Check if notification already exists to avoid spamming
        const existingNotification = await this.notificationRepository.findOne({
            sender: senderId,
            receiver: receiverId,
            type: ENotificationType.LIKE_COMMENT,
            'extra.commentId': new Types.ObjectId(commentId),
            isDeleted: false,
        });

        if (existingNotification) {
            return existingNotification;
        }

        return await this.create(
            {
                sender: new Types.ObjectId(senderId),
                receiver: new Types.ObjectId(receiverId),
                type: ENotificationType.LIKE_COMMENT,
                extra: {
                    postId: new Types.ObjectId(postId),
                    commentId: new Types.ObjectId(commentId),
                },
                isRead: false,
                isDeleted: false,
            },
            senderId,
            {
                path: 'sender',
                select: POPULATE_USER,
            }
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

        // Add friendship using FriendshipService
        await this.friendshipService.addFriend(receiverId, senderId, userId);

        // Create accept notification
        await this.create(
            {
                sender: new Types.ObjectId(receiverId),
                receiver: new Types.ObjectId(senderId),
                type: ENotificationType.ACCEPT_FRIEND_REQUEST,
                isRead: false,
                isDeleted: false,
            },
            userId,
            {
                path: 'sender',
                select: POPULATE_USER,
            }
        );

        // Mark original request as handled
        await this.markFriendRequestAsHandled(notificationId);

        // Create private conversation between the two users
        // getPrivateConversation will create if it doesn't exist, or return existing one
        const conversationResult =
            await this.conversationService.getPrivateConversation(
                senderId,
                receiverId
            );

        return {
            success: true,
            notification: await this.getById(notificationId),
            conversation: conversationResult.conversation,
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

    /**
     * Mark friend request as handled (soft delete)
     * @param notificationId - Notification ID
     * @returns Updated notification
     */
    async markFriendRequestAsHandled(notificationId: string) {
        this.validateId(notificationId, 'Notification ID');

        return await this.update(
            notificationId,
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            'system'
        );
    }
}
