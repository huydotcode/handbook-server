import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import {
    getAuthenticatedUserId,
    getOptionalUserId,
    getPaginationParams,
    validateRequiredBodyField,
    validateRequiredParam,
} from '../common/utils/controller.helper';
import { GroupService } from '../services/group.service';

/**
 * Controller handling HTTP endpoints for groups.
 */
export class GroupController {
    private groupService: GroupService;

    constructor() {
        this.groupService = new GroupService();
    }

    /**
     * GET /api/v1/groups/:id
     * Retrieve group details by ID.
     */
    public getGroupByGroupId = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            validateRequiredParam(groupId, 'Group ID');

            const group = await this.groupService.getGroupByIdWithDetails(
                groupId
            );
            ResponseUtil.success(res, group, 'Group retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/groups/joined
     * Retrieve groups the user has joined.
     */
    public getJoinedGroups = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId =
                (req.query.user_id as string) || getOptionalUserId(req);

            if (!userId) {
                const authenticatedUserId = getAuthenticatedUserId(req);
                const groups = await this.groupService.getJoinedGroups(
                    authenticatedUserId
                );
                ResponseUtil.success(
                    res,
                    groups,
                    'Joined groups retrieved successfully'
                );
            } else {
                const groups = await this.groupService.getJoinedGroups(userId);
                ResponseUtil.success(
                    res,
                    groups,
                    'Joined groups retrieved successfully'
                );
            }
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/groups
     * Create a new group.
     */
    public createGroup = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const groupData = req.body;
            validateRequiredBodyField(req.body, 'name');
            validateRequiredBodyField(req.body, 'description');
            validateRequiredBodyField(req.body, 'avatar');

            const group = await this.groupService.createGroup(
                groupData,
                userId
            );

            ResponseUtil.created(res, group, 'Group created successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/groups/:id
     * Update group information.
     */
    public updateGroup = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            validateRequiredParam(groupId, 'Group ID');
            const userId = getAuthenticatedUserId(req);
            const groupData = req.body;

            const group = await this.groupService.updateGroup(
                groupId,
                groupData,
                userId
            );

            ResponseUtil.success(res, group, 'Group updated successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/groups/:id
     * Delete a group (only creator can delete).
     */
    public deleteGroup = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            validateRequiredParam(groupId, 'Group ID');
            const userId = getAuthenticatedUserId(req);

            await this.groupService.deleteGroup(groupId, userId);

            ResponseUtil.success(
                res,
                { success: true },
                'Group deleted successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/groups/:id/join
     * Join a group.
     */
    public joinGroup = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            validateRequiredParam(groupId, 'Group ID');
            const userId = getAuthenticatedUserId(req);

            const group = await this.groupService.joinGroup(groupId, userId);

            ResponseUtil.success(res, group, 'Joined group successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/groups/:id/leave
     * Leave a group.
     */
    public leaveGroup = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            validateRequiredParam(groupId, 'Group ID');
            const userId = getAuthenticatedUserId(req);

            const group = await this.groupService.leaveGroup(groupId, userId);

            ResponseUtil.success(res, group, 'Left group successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/groups/:id/members
     * Get group members with pagination.
     */
    public getGroupMembers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            validateRequiredParam(groupId, 'Group ID');
            const { page, pageSize } = getPaginationParams(req, 20);

            const result = await this.groupService.getGroupMembers(
                groupId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Group members retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/groups/recommended
     * Get recommended groups for a user.
     */
    public getRecommendedGroups = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId =
                (req.query.user_id as string) || getAuthenticatedUserId(req);
            validateRequiredParam(userId, 'User ID');

            const groups = await this.groupService.getRecommendedGroups(userId);

            ResponseUtil.success(
                res,
                groups,
                'Recommended groups retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/groups/:id/cover-photo
     * Update group cover photo (admin or creator only).
     */
    public updateCoverPhoto = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            validateRequiredParam(groupId, 'Group ID');
            const userId = getAuthenticatedUserId(req);
            const { coverPhoto } = req.body;
            validateRequiredBodyField(req.body, 'coverPhoto');

            const group = await this.groupService.updateCoverPhoto(
                groupId,
                coverPhoto,
                userId
            );

            ResponseUtil.success(
                res,
                group,
                'Cover photo updated successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/groups/:id/avatar
     * Update group avatar (admin or creator only).
     */
    public updateAvatar = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            validateRequiredParam(groupId, 'Group ID');
            const userId = getAuthenticatedUserId(req);
            const { avatar } = req.body;
            validateRequiredBodyField(req.body, 'avatar');

            const group = await this.groupService.updateAvatar(
                groupId,
                avatar,
                userId
            );

            ResponseUtil.success(res, group, 'Avatar updated successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/groups (Admin only)
     * Get all groups with pagination.
     */
    public getAllGroups = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { page, pageSize } = getPaginationParams(req, 20);

            const result = await this.groupService.getAllGroups(page, pageSize);

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Groups retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
