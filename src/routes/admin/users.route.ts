import { Router } from 'express';
import { UserController } from '../../controllers/user.controller';
import { EApiMethod, IApiRoute } from '../../common/types/route.type';
import addRoutes from '../../common/utils/add-route';

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
];

addRoutes(userAdminRouter, routes);

export default userAdminRouter;
