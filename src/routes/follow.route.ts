import { Router } from 'express';
import { FollowController } from '../controllers/follow.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const followRouter = Router();
const followController = new FollowController();

const followRoutes: IApiRoute[] = [
    // Specific routes first
    {
        path: '/:userId/followings',
        method: EApiMethod.GET,
        controller: followController.getFollowings,
        isRateLimited: true,
    },
    // Collection routes
    {
        path: '/',
        method: EApiMethod.POST,
        controller: followController.followUser,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    // Dynamic routes last
    {
        path: '/:userId',
        method: EApiMethod.DELETE,
        controller: followController.unfollowUser,
        isPrivateRoute: true,
        isRateLimited: true,
    },
];

addRoutes(followRouter, followRoutes);

export default followRouter;
