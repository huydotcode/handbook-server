import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const conversationRouter = Router();
const conversationController = new ConversationController();

const conversationRoutes: IApiRoute[] = [
    // Specific routes first
    {
        path: '/:id/participants/:participantId',
        method: EApiMethod.DELETE,
        controller: conversationController.removeParticipant,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/pin/:messageId',
        method: EApiMethod.DELETE,
        controller: conversationController.unpinMessage,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/participants',
        method: EApiMethod.POST,
        controller: conversationController.addParticipant,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/pin',
        method: EApiMethod.POST,
        controller: conversationController.pinMessage,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    // Collection routes
    {
        path: '/',
        method: EApiMethod.GET,
        controller: conversationController.getConversations,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/',
        method: EApiMethod.POST,
        controller: conversationController.createConversation,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    // Dynamic routes last
    {
        path: '/:id',
        method: EApiMethod.GET,
        controller: conversationController.getConversationById,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id',
        method: EApiMethod.PUT,
        controller: conversationController.updateConversation,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id',
        method: EApiMethod.DELETE,
        controller: conversationController.deleteConversation,
        isPrivateRoute: true,
        isRateLimited: true,
    },
];

addRoutes(conversationRouter, conversationRoutes);

export default conversationRouter;
