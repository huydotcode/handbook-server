import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const messageRouter = Router();
const messageController = new MessageController();

const messageRoutes: IApiRoute[] = [
    {
        path: '/conversation/:conversation_id',
        method: EApiMethod.GET,
        controller: messageController.getMessages,
    },
    {
        path: '/conversation/:conversation_id/search',
        method: EApiMethod.GET,
        controller: messageController.search,
    },
    {
        path: '/conversation/:conversation_id/pinned',
        method: EApiMethod.GET,
        controller: messageController.getPinnedMessages,
    },
];

addRoutes(messageRouter, messageRoutes);

export default messageRouter;
