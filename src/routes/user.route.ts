import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { FriendController } from '../controllers/friend.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const userRouter = Router();
const userController = new UserController();
const friendController = new FriendController();

const userRoutes: IApiRoute[] = [
    // Specific routes first
    {
        path: '/:id/cover-photo',
        method: EApiMethod.PUT,
        controller: userController.updateCoverPhoto,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/avatar',
        method: EApiMethod.PUT,
        controller: userController.updateAvatar,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/profile',
        method: EApiMethod.PUT,
        controller: userController.updateProfile,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/profile',
        method: EApiMethod.GET,
        controller: userController.getUserProfile,
        isRateLimited: true,
    },
    {
        path: '/:id/pictures',
        method: EApiMethod.GET,
        controller: userController.getProfilePictures,
        isRateLimited: true,
    },
    {
        path: '/:id/bio',
        method: EApiMethod.PUT,
        controller: userController.updateBio,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/friends',
        method: EApiMethod.GET,
        controller: userController.getFriends,
        isRateLimited: true,
    },
    {
        path: '/:userId/friends-with-conversations',
        method: EApiMethod.GET,
        controller: friendController.getFriendsWithConversations,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    // Collection routes
    // Dynamic routes last
    {
        path: '/:id',
        method: EApiMethod.GET,
        controller: userController.getUserById,
        isPrivateRoute: true,
        isRateLimited: true,
    },
];

addRoutes(userRouter, userRoutes);

export default userRouter;
