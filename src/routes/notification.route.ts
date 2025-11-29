import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const notificationRouter = Router();
const notificationController = new NotificationController();

const notificationRoutes: IApiRoute[] = [
    // Specific routes first
    {
        path: '/:id/accept',
        method: EApiMethod.POST,
        controller: notificationController.acceptFriendRequest,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/decline',
        method: EApiMethod.POST,
        controller: notificationController.declineFriendRequest,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/read-all',
        method: EApiMethod.PUT,
        controller: notificationController.markAllAsRead,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/request',
        method: EApiMethod.POST,
        controller: notificationController.sendFriendRequest,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/follow',
        method: EApiMethod.POST,
        controller: notificationController.createFollowNotification,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/by-users',
        method: EApiMethod.DELETE,
        controller: notificationController.deleteNotificationByUsers,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/receiver/:receiverId',
        method: EApiMethod.GET,
        controller: notificationController.getNotificationsByReceiver,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/sender/:senderId',
        method: EApiMethod.GET,
        controller: notificationController.getRequestsBySender,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    // Collection routes
    {
        path: '/',
        method: EApiMethod.POST,
        controller: notificationController.createNotification,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    // Dynamic routes last
    {
        path: '/:id',
        method: EApiMethod.DELETE,
        controller: notificationController.deleteNotification,
        isPrivateRoute: true,
        isRateLimited: true,
    },
];

addRoutes(notificationRouter, notificationRoutes);

export default notificationRouter;
