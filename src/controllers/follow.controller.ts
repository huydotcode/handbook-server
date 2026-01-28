import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { FollowService } from '../services/follow.service';
import { BaseController } from './base.controller';

/**
 * Controller for follow-related HTTP endpoints.
 */
export class FollowController extends BaseController {
    private followService: FollowService;

    constructor() {
        super();
        this.followService = new FollowService();
    }

    /**
     * POST /api/v1/follows
     * Follow a user.
     */
    public followUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const followerId = this.getAuthenticatedUserId(req);
            const { following } = req.body;
            this.validateRequiredBodyField(req.body, 'following');

            const follow = await this.followService.followUser(
                followerId,
                following,
                followerId
            );

            ResponseUtil.created(res, follow, 'User followed successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/follows/:userId/followings
     * Fetch followings for a user.
     */
    public getFollowings = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.userId;
            this.validateRequiredParam(userId, 'User ID');

            const followings = await this.followService.getFollowing(userId);

            ResponseUtil.success(
                res,
                followings,
                'Followings retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/follows/:userId
     * Unfollow a user.
     */
    public unfollowUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const followerId = this.getAuthenticatedUserId(req);
            const followingId = req.params.userId;
            this.validateRequiredParam(followingId, 'User ID');

            await this.followService.unfollowUser(
                followerId,
                followingId,
                followerId
            );

            ResponseUtil.success(
                res,
                { success: true },
                'User unfollowed successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
