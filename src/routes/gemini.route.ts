import { Router } from 'express';
import { GeminiController } from '../controllers/gemini.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const geminiRouter = Router();
const geminiController = new GeminiController();

const geminiRoutes: IApiRoute[] = [
    {
        path: '/chat',
        method: EApiMethod.POST,
        controller: geminiController.chat,
        isPrivateRoute: true,
        isRateLimited: true,
    },
];

addRoutes(geminiRouter, geminiRoutes);

export default geminiRouter;
