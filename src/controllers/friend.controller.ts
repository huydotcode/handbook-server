import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils';
import friendService from '../services/friend.service';
import { BaseController } from './base.controller';

export class FriendController extends BaseController {
    constructor() {
        super();
    }

    /**
     * Get friends with their conversations
     * GET /api/v1/users/:userId/friends-with-conversations
     */
    public getFriendsWithConversations = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { userId } = req.params;

            const result =
                await friendService.getFriendsWithConversations(userId);

            ResponseUtil.success(
                res,
                result,
                'Lấy danh sách bạn bè thành công'
            );
        } catch (error) {
            next(error);
        }
    };
}
