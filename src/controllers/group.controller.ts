import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import {
    getAuthenticatedUserId,
    getOptionalUserId,
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
}
