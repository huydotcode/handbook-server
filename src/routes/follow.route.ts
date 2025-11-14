import { Router } from 'express';
import { FollowController } from '../controllers/follow.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const followRouter = Router();
const followController = new FollowController();

const followRoutes: IApiRoute[] = [
    {
        path: '/:user_id/followings',
        method: EApiMethod.GET,
        controller: followController.getFollowings,
    },
];

addRoutes(followRouter, followRoutes);

export default followRouter;
