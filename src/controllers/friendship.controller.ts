import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import {
    validateRequiredParam,
    getAuthenticatedUserId,
    validateRequiredBodyField,
} from '../common/utils/controller.helper';
import { FriendshipService } from '../services/friendship.service';

/**
 * Controller for friendship-related HTTP endpoints.
 */
export class FriendshipController {
    private friendshipService: FriendshipService;

    constructor() {
        this.friendshipService = new FriendshipService();
    }

    /**
     * POST /api/v1/friendships
     * Add two users as friends.
     */
    public addFriend = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId1 = getAuthenticatedUserId(req);
            const { userId2 } = req.body;
            validateRequiredBodyField(req.body, 'userId2');

            const friendship = await this.friendshipService.addFriend(
                userId1,
                userId2,
                userId1
            );

            ResponseUtil.created(res, friendship, 'Friend added successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/friendships/:userId
     * Get all friends of a user.
     */
    public getFriends = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.userId;
            validateRequiredParam(userId, 'User ID');

            const friends = await this.friendshipService.getFriends(userId);

            ResponseUtil.success(
                res,
                friends,
                'Friends retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/friendships/:userId/count
     * Get friends count for a user.
     */
    public getFriendsCount = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.userId;
            validateRequiredParam(userId, 'User ID');

            const count = await this.friendshipService.getFriendsCount(userId);

            ResponseUtil.success(
                res,
                { count },
                'Friends count retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/friendships/:userId1/common/:userId2
     * Find common friends between two users.
     */
    public getCommonFriends = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId1 = req.params.userId1;
            const userId2 = req.params.userId2;
            validateRequiredParam(userId1, 'User 1 ID');
            validateRequiredParam(userId2, 'User 2 ID');

            const commonFriends =
                await this.friendshipService.findCommonFriends(
                    userId1,
                    userId2
                );

            ResponseUtil.success(
                res,
                { commonFriends },
                'Common friends retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/friendships/check/:userId
     * Check if two users are friends.
     */
    public checkFriendship = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId1 = getAuthenticatedUserId(req);
            const userId2 = req.params.userId;
            validateRequiredParam(userId2, 'User ID');

            const areFriends = await this.friendshipService.areFriends(
                userId1,
                userId2
            );

            ResponseUtil.success(
                res,
                { areFriends },
                'Friendship status retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/friendships/:userId
     * Remove friendship between two users.
     */
    public removeFriend = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId1 = getAuthenticatedUserId(req);
            const userId2 = req.params.userId;
            validateRequiredParam(userId2, 'User ID');

            await this.friendshipService.removeFriend(
                userId1,
                userId2,
                userId1
            );

            ResponseUtil.success(
                res,
                { success: true },
                'Friend removed successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
