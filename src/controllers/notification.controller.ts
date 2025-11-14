import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { NotificationService } from '../services/notification.service';
import { AppError } from '../common/errors/app.error';
import { HTTP_STATUS } from '../common/constants/status-code';

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

            if (!receiverId) {
                throw new AppError(
                    'Receiver ID is required',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            const page = parseInt((req.query.page as string) || '1', 10) || 1;
            const pageSize =
                parseInt(
                    (req.query.page_size as string) ||
                        (req.query.pageSize as string) ||
                        '10',
                    10
                ) || 10;

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
            if (!senderId) {
                throw new AppError(
                    'Sender ID is required',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            const page = parseInt((req.query.page as string) || '1', 10) || 1;
            const pageSize =
                parseInt(
                    (req.query.page_size as string) ||
                        (req.query.pageSize as string) ||
                        '10',
                    10
                ) || 10;

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
