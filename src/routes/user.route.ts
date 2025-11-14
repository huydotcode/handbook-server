import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const userRouter = Router();
const userController = new UserController();

const userRoutes: IApiRoute[] = [
    {
        path: '/',
        method: EApiMethod.GET,
        controller: userController.getUsers,
    },
    {
        path: '/:id/friends',
        method: EApiMethod.GET,
        controller: userController.getFriends,
    },
];

addRoutes(userRouter, userRoutes);

export default userRouter;
