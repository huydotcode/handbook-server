import { Router } from 'express';
import { EApiMethod, IApiRoute } from '../../common/types/route.type';
import addRoutes from '../../common/utils/add-route';
import { UserController } from '../../controllers/user.controller';

const userAdminRouter = Router();
const userController = new UserController();

const routes: IApiRoute[] = [
    {
        path: '/',
        method: EApiMethod.GET,
        controller: userController.getUsers,
        isRateLimited: true,
    },
    {
        path: '/:id/block',
        method: EApiMethod.PATCH,
        controller: userController.blockUser,
        isRateLimited: true,
    },
    {
        path: '/:id/unblock',
        method: EApiMethod.PATCH,
        controller: userController.unblockUser,
        isRateLimited: true,
    },
    {
        path: '/:id/role',
        method: EApiMethod.PATCH,
        controller: userController.updateRole,
        isRateLimited: true,
    },
    {
        path: '/:id/verify',
        method: EApiMethod.PATCH,
        controller: userController.verifyUser,
        isRateLimited: true,
    },
    {
        path: '/:id/unverify',
        method: EApiMethod.PATCH,
        controller: userController.unverifyUser,
        isRateLimited: true,
    },
];

addRoutes(userAdminRouter, routes);

export default userAdminRouter;
