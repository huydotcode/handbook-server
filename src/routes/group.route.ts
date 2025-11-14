import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const groupRouter = Router();
const groupController = new GroupController();

const groupRoutes: IApiRoute[] = [
    {
        path: '/joined',
        method: EApiMethod.GET,
        controller: groupController.getJoinedGroups,
    },
    {
        path: '/:id',
        method: EApiMethod.GET,
        controller: groupController.getGroupByGroupId,
    },
];

addRoutes(groupRouter, groupRoutes);

export default groupRouter;
