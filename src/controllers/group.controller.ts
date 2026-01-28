import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { GroupService } from '../services/group.service';
import { BaseController } from './base.controller';

/**
 * Controller handling HTTP endpoints for groups.
 */
export class GroupController extends BaseController {
    private groupService: GroupService;

    constructor() {
        super();
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
            this.validateRequiredParam(groupId, 'Group ID');

            const group =
                await this.groupService.getGroupByIdWithDetails(groupId);
            ResponseUtil.success(res, group, 'Group retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/groups/:id/access
     * Check if user has access to group.
     */
    public checkAccess = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            this.validateRequiredParam(groupId, 'Group ID');
            const userId = this.getOptionalUserId(req);

            const result = await this.groupService.checkUserAccess(
                groupId,
                userId
            );
            ResponseUtil.success(res, result, 'Access check completed');
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
                (req.query.user_id as string) || this.getOptionalUserId(req);

            if (!userId) {
                const authenticatedUserId = this.getAuthenticatedUserId(req);
                const groups =
                    await this.groupService.getJoinedGroups(
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
            const userId = this.getAuthenticatedUserId(req);
            const groupData = req.body;
            this.validateRequiredBodyField(req.body, 'name');
            this.validateRequiredBodyField(req.body, 'description');
            this.validateRequiredBodyField(req.body, 'avatar');

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
            this.validateRequiredParam(groupId, 'Group ID');
            const userId = this.getAuthenticatedUserId(req);
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
            this.validateRequiredParam(groupId, 'Group ID');
            const userId = this.getAuthenticatedUserId(req);

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
            this.validateRequiredParam(groupId, 'Group ID');
            const userId = this.getAuthenticatedUserId(req);

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
            this.validateRequiredParam(groupId, 'Group ID');
            const userId = this.getAuthenticatedUserId(req);

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
            this.validateRequiredParam(groupId, 'Group ID');
            const { page, pageSize } = this.getPaginationParams(req, 20);

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
                (req.query.user_id as string) ||
                this.getAuthenticatedUserId(req);
            this.validateRequiredParam(userId, 'User ID');

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
            this.validateRequiredParam(groupId, 'Group ID');
            const userId = this.getAuthenticatedUserId(req);
            const { coverPhoto } = req.body;
            this.validateRequiredBodyField(req.body, 'coverPhoto');

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
            this.validateRequiredParam(groupId, 'Group ID');
            const userId = this.getAuthenticatedUserId(req);
            const { avatar } = req.body;
            this.validateRequiredBodyField(req.body, 'avatar');

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
            const { page, pageSize } = this.getPaginationParams(req, 20);

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

    /**
     * POST /api/v1/groups/:id/members
     * Add a member to the group (admin or creator only).
     */
    public addMember = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            this.validateRequiredParam(groupId, 'Group ID');
            const userId = this.getAuthenticatedUserId(req);
            const { user, role } = req.body as { user: string; role?: string };
            this.validateRequiredBodyField(req.body, 'user');

            // Verify permissions inside service (admin/creator)
            const group = await this.groupService.addMember(groupId, user);

            ResponseUtil.success(res, group, 'Member added successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/groups/:id/members/:userId
     * Remove a member from the group (admin or creator only).
     */
    public removeMember = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            const targetUserId = req.params.userId;
            this.validateRequiredParam(groupId, 'Group ID');
            this.validateRequiredParam(targetUserId, 'User ID');
            const userId = this.getAuthenticatedUserId(req);

            const group = await this.groupService.removeMember(
                groupId,
                targetUserId
            );

            ResponseUtil.success(res, group, 'Member removed successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/groups/:id/members/:userId/role
     * Update a member's role (admin or creator only).
     */
    public updateMemberRole = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const groupId = req.params.id;
            const targetUserId = req.params.userId;
            const { role } = req.body as { role: 'ADMIN' | 'MEMBER' };
            this.validateRequiredParam(groupId, 'Group ID');
            this.validateRequiredParam(targetUserId, 'User ID');
            this.validateRequiredBodyField(req.body, 'role');
            const userId = this.getAuthenticatedUserId(req);

            const updated = await this.groupService.updateMemberRole(
                groupId,
                targetUserId,
                role as any
            );

            ResponseUtil.success(
                res,
                updated,
                'Member role updated successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
