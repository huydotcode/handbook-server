import { Router } from 'express';
import { GroupController } from '../../controllers/group.controller';
import { EApiMethod, IApiRoute } from '../../common/types/route.type';
import addRoutes from '../../common/utils/add-route';

const groupAdminRouter = Router();
const groupController = new GroupController();

const routes: IApiRoute[] = [
    {
        path: '/',
        method: EApiMethod.GET,
        controller: groupController.getAllGroups,
        isRateLimited: true,
    },
];

addRoutes(groupAdminRouter, routes);

export default groupAdminRouter;
