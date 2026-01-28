import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';
import { aiRateLimiter } from '../common/middleware/rateLimit';

const aiRouter = Router();
const aiController = new AIController();

const aiRoutes: IApiRoute[] = [
    {
        path: '/chat',
        method: EApiMethod.POST,
        controller: aiController.chat,
        isPrivateRoute: true,
        isRateLimited: true,
        middlewares: [aiRateLimiter],
    },
];

addRoutes(aiRouter, aiRoutes);

export default aiRouter;
