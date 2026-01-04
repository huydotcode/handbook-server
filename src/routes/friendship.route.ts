import { Router } from 'express';
import { FriendshipController } from '../controllers/friendship.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const friendshipRouter = Router();
const friendshipController = new FriendshipController();

const friendshipRoutes: IApiRoute[] = [
    // Specific routes first
    {
        path: '/:userId/count',
        method: EApiMethod.GET,
        controller: friendshipController.getFriendsCount,
        isRateLimited: true,
    },
    {
        path: '/:userId1/common/:userId2',
        method: EApiMethod.GET,
        controller: friendshipController.getCommonFriends,
        isRateLimited: true,
    },
    {
        path: '/check/:userId',
        method: EApiMethod.GET,
        controller: friendshipController.checkFriendship,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    // Collection routes
    {
        path: '/',
        method: EApiMethod.POST,
        controller: friendshipController.addFriend,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    // Dynamic routes last
    {
        path: '/:userId',
        method: EApiMethod.GET,
        controller: friendshipController.getFriends,
        isRateLimited: true,
    },
    {
        path: '/:userId',
        method: EApiMethod.DELETE,
        controller: friendshipController.removeFriend,
        isPrivateRoute: true,
        isRateLimited: true,
    },
];

addRoutes(friendshipRouter, friendshipRoutes);

export default friendshipRouter;
