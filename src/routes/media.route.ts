import { Router } from 'express';
import { MediaController } from '../controllers/media.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const mediaRouter = Router();
const mediaController = new MediaController();

const mediaRoutes: IApiRoute[] = [
    // Collection routes
    {
        path: '/',
        method: EApiMethod.GET,
        controller: mediaController.getAllMedias,
        isAdminRoute: true,
        isRateLimited: true,
    },
    // Dynamic routes last
    {
        path: '/:id',
        method: EApiMethod.DELETE,
        controller: mediaController.deleteMedia,
        isAdminRoute: true,
        isRateLimited: true,
    },
];

addRoutes(mediaRouter, mediaRoutes);

export default mediaRouter;
