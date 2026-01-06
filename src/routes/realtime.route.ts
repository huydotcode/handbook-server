import { Router } from 'express';
import { RealtimeController } from '../controllers/realtime.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const realtimeRouter = Router();
const realtimeController = new RealtimeController();

const realtimeRoutes: IApiRoute[] = [
    {
        path: '/users/:id/conversations',
        method: EApiMethod.GET,
        controller: realtimeController.getUserConversations,
    },
    {
        path: '/users/:id/status',
        method: EApiMethod.PATCH,
        controller: realtimeController.updateUserStatus,
    },
    {
        path: '/users/:id/friends/online',
        method: EApiMethod.GET,
        controller: realtimeController.getOnlineFriends,
    },
    {
        path: '/users/:id',
        method: EApiMethod.GET,
        controller: realtimeController.getUserDetails,
    },
    {
        path: '/heartbeat/cleanup',
        method: EApiMethod.POST,
        controller: realtimeController.cleanupOfflineUsers,
    },
];

addRoutes(realtimeRouter, realtimeRoutes);

export default realtimeRouter;
