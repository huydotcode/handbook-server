import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const groupRouter = Router();
const groupController = new GroupController();

const groupRoutes: IApiRoute[] = [
    // Specific routes first
    {
        path: '/:id/access',
        method: EApiMethod.GET,
        controller: groupController.checkAccess,
        isRateLimited: true,
    },
    {
        path: '/:id/avatar',
        method: EApiMethod.PUT,
        controller: groupController.updateAvatar,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/cover-photo',
        method: EApiMethod.PUT,
        controller: groupController.updateCoverPhoto,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/members',
        method: EApiMethod.GET,
        controller: groupController.getGroupMembers,
        isRateLimited: true,
    },
    {
        path: '/:id/members',
        method: EApiMethod.POST,
        controller: groupController.addMember,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/members/:userId',
        method: EApiMethod.DELETE,
        controller: groupController.removeMember,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/members/:userId/role',
        method: EApiMethod.PUT,
        controller: groupController.updateMemberRole,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/join',
        method: EApiMethod.POST,
        controller: groupController.joinGroup,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/leave',
        method: EApiMethod.POST,
        controller: groupController.leaveGroup,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/recommended',
        method: EApiMethod.GET,
        controller: groupController.getRecommendedGroups,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/joined',
        method: EApiMethod.GET,
        controller: groupController.getJoinedGroups,
        isRateLimited: true,
    },
    // Collection routes
    {
        path: '/',
        method: EApiMethod.POST,
        controller: groupController.createGroup,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    // Dynamic routes last
    {
        path: '/:id',
        method: EApiMethod.PUT,
        controller: groupController.updateGroup,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id',
        method: EApiMethod.DELETE,
        controller: groupController.deleteGroup,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id',
        method: EApiMethod.GET,
        controller: groupController.getGroupByGroupId,
        isRateLimited: true,
    },
];

addRoutes(groupRouter, groupRoutes);

export default groupRouter;
