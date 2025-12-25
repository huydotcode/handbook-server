import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const userRouter = Router();
const userController = new UserController();

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
    // Collection routes
    {
        path: '/',
        method: EApiMethod.GET,
        controller: userController.getUsers,
        isRateLimited: true,
    },
    // Dynamic routes last
    {
        path: '/:id',
        method: EApiMethod.GET,
        controller: userController.getUserById,
        isRateLimited: true,
    },
];

addRoutes(userRouter, userRoutes);

export default userRouter;
