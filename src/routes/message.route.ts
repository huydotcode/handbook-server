import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const messageRouter = Router();
const messageController = new MessageController();

const messageRoutes: IApiRoute[] = [
    {
        path: '/conversation/:conversationId/search',
        method: EApiMethod.GET,
        controller: messageController.search,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/conversation/:conversationId/pinned',
        method: EApiMethod.GET,
        controller: messageController.getPinnedMessages,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/conversation/:conversationId',
        method: EApiMethod.GET,
        controller: messageController.getMessages,
        isPrivateRoute: true,
        isRateLimited: true,
    },
];

addRoutes(messageRouter, messageRoutes);

export default messageRouter;
