import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import {
    getPaginationParams,
    validateRequiredParam,
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
}
