import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { FollowService } from '../services/follow.service';
import { AppError } from '../common/errors/app.error';
import { HTTP_STATUS } from '../common/constants/status-code';

/**
 * Controller for follow-related HTTP endpoints.
 */
export class FollowController {
    private followService: FollowService;

    constructor() {
        this.followService = new FollowService();
    }

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
            const userId = req.params.user_id;

            if (!userId) {
                throw new AppError(
                    'User ID is required',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

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
}
