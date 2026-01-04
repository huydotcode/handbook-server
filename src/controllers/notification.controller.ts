import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import {
    getPaginationParams,
    validateRequiredParam,
    getAuthenticatedUserId,
    validateRequiredBodyField,
} from '../common/utils/controller.helper';
import { NotificationService } from '../services/notification.service';

/**
 * Controller responsible for notification-related endpoints.
 */
export class NotificationController {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    /**
     * GET /api/v1/notifications/receiver/:receiverId
     * Fetch paginated notifications for a receiver.
     */
    public getNotificationsByReceiver = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const receiverId = req.params.receiverId;
            validateRequiredParam(receiverId, 'Receiver ID');

            const { page, pageSize } = getPaginationParams(req, 10);

            const result =
                await this.notificationService.getNotificationsWithPagination(
                    receiverId,
                    page,
                    pageSize
                );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Notifications retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/notifications/sender/:senderId
     * Fetch request notifications created by a sender.
     */
    public getRequestsBySender = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const senderId = req.params.senderId;
            validateRequiredParam(senderId, 'Sender ID');

            const { page, pageSize } = getPaginationParams(req, 10);

            const result = await this.notificationService.getRequestsBySender(
                senderId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Requests retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/notifications/request
     * Send friend request.
     */
    public sendFriendRequest = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const senderId = getAuthenticatedUserId(req);
            const { receiver } = req.body;
            validateRequiredBodyField(req.body, 'receiver');

            const notification =
                await this.notificationService.sendFriendRequest(
                    senderId,
                    receiver
                );

            ResponseUtil.created(
                res,
                notification,
                'Friend request sent successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/notifications/follow
     * Create follow user notification.
     */
    public createFollowNotification = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const { receiver } = req.body;
            validateRequiredBodyField(req.body, 'receiver');

            const notification =
                await this.notificationService.createFollowUserNotification(
                    userId,
                    receiver
                );

            ResponseUtil.created(
                res,
                notification,
                'Follow notification created successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/notifications/:id/accept
     * Accept friend request.
     */
    public acceptFriendRequest = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const notificationId = req.params.id;
            validateRequiredParam(notificationId, 'Notification ID');
            const userId = getAuthenticatedUserId(req);

            const result = await this.notificationService.acceptFriendRequest(
                notificationId,
                userId
            );

            ResponseUtil.success(
                res,
                result,
                'Friend request accepted successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/notifications/:id/decline
     * Decline friend request.
     */
    public declineFriendRequest = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const notificationId = req.params.id;
            validateRequiredParam(notificationId, 'Notification ID');
            const userId = getAuthenticatedUserId(req);

            const result = await this.notificationService.declineFriendRequest(
                notificationId,
                userId
            );

            ResponseUtil.success(
                res,
                result,
                'Friend request declined successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/notifications
     * Create notification.
     */
    public createNotification = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const notificationData = req.body;
            validateRequiredBodyField(req.body, 'receiver');
            validateRequiredBodyField(req.body, 'type');

            const notification =
                await this.notificationService.createNotification(
                    notificationData,
                    userId
                );

            ResponseUtil.created(
                res,
                notification,
                'Notification created successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/notifications/:id
     * Get notification by ID.
     */
    public getNotificationById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const notificationId = req.params.id;
            validateRequiredParam(notificationId, 'Notification ID');

            const notification =
                await this.notificationService.getNotificationById(
                    notificationId
                );

            ResponseUtil.success(
                res,
                notification,
                'Notification retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/notifications/read-all
     * Mark all notifications as read.
     */
    public markAllAsRead = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);

            await this.notificationService.markAllAsRead(userId);

            ResponseUtil.success(
                res,
                { success: true },
                'All notifications marked as read'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/notifications/:id
     * Delete notification.
     */
    public deleteNotification = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const notificationId = req.params.id;
            validateRequiredParam(notificationId, 'Notification ID');
            const userId = getAuthenticatedUserId(req);

            await this.notificationService.deleteNotification(
                notificationId,
                userId
            );

            ResponseUtil.success(
                res,
                { success: true },
                'Notification deleted successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/notifications/by-users
     * Delete notifications by users (sender and receiver).
     */
    public deleteNotificationByUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const { sender, receiver } = req.body;
            validateRequiredBodyField(req.body, 'sender');
            validateRequiredBodyField(req.body, 'receiver');

            await this.notificationService.deleteNotificationByUsers(
                sender,
                receiver,
                userId
            );

            ResponseUtil.success(
                res,
                { success: true },
                'Notifications deleted successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
