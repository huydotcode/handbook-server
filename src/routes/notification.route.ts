import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const notificationRouter = Router();
const notificationController = new NotificationController();

const notificationRoutes: IApiRoute[] = [
    {
        path: '/receiver/:receiverId',
        method: EApiMethod.GET,
        controller: notificationController.getNotificationsByReceiver,
    },
    {
        path: '/sender/:senderId',
        method: EApiMethod.GET,
        controller: notificationController.getRequestsBySender,
    },
];

addRoutes(notificationRouter, notificationRoutes);

export default notificationRouter;
