import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { IFriendshipModel } from '../models/friendship.model';
import { FriendshipRepository } from '../repositories/friendship.repository';
import { BaseService } from './base.service';

/**
 * Service responsible for friendship logic.
 */
export class FriendshipService extends BaseService<IFriendshipModel> {
    private friendshipRepository: FriendshipRepository;

    constructor() {
        const repository = new FriendshipRepository();
        super(repository);
        this.friendshipRepository = repository;
    }

    /**
     * Add two users as friends
     * @param userId1 - First user ID
     * @param userId2 - Second user ID
     * @param userId - User ID performing the action
     * @returns Created friendship relationship
     */
    async addFriend(userId1: string, userId2: string, userId: string) {
        this.validateId(userId1, 'User 1 ID');
        this.validateId(userId2, 'User 2 ID');

        // Check if user is trying to befriend themselves
        if (userId1 === userId2) {
            throw new AppError(
                'Cannot befriend yourself',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Check if already friends
        const alreadyFriends = await this.friendshipRepository.areFriends(
            userId1,
            userId2
        );

        if (alreadyFriends) {
            throw new AppError(
                'Users are already friends',
                HTTP_STATUS.CONFLICT
            );
        }

        const friendship = await this.friendshipRepository.addFriend(
            userId1,
            userId2
        );

        return friendship;
    }

    /**
     * Remove friendship between two users
     * @param userId1 - First user ID
     * @param userId2 - Second user ID
     * @param userId - User ID performing the action
     * @returns True if friendship removed
     */
    async removeFriend(userId1: string, userId2: string, userId: string) {
        this.validateId(userId1, 'User 1 ID');
        this.validateId(userId2, 'User 2 ID');

        const deleted = await this.friendshipRepository.removeFriend(
            userId1,
            userId2
        );

        if (!deleted) {
            throw new NotFoundError(
                `Friendship not found between userId: ${userId1} and ${userId2}`
            );
        }

        return true;
    }

    /**
     * Get all friends of a user
     * @param userId - User ID
     * @returns Array of friends with populated user data
     */
    async getFriends(userId: string) {
        this.validateId(userId, 'User ID');
        return await this.friendshipRepository.findFriendsOfUser(userId);
    }

    /**
     * Get all friend IDs of a user
     * @param userId - User ID
     * @returns Array of friend user IDs
     */
    async getFriendIds(userId: string): Promise<string[]> {
        this.validateId(userId, 'User ID');
        return await this.friendshipRepository.getFriendIds(userId);
    }

    /**
     * Check if two users are friends
     * @param userId1 - First user ID
     * @param userId2 - Second user ID
     * @returns true if they are friends, false otherwise
     */
    async areFriends(userId1: string, userId2: string): Promise<boolean> {
        this.validateId(userId1, 'User 1 ID');
        this.validateId(userId2, 'User 2 ID');
        return await this.friendshipRepository.areFriends(userId1, userId2);
    }

    /**
     * Get count of friends for a user
     * @param userId - User ID
     * @returns Number of friends
     */
    async getFriendsCount(userId: string): Promise<number> {
        this.validateId(userId, 'User ID');
        return await this.friendshipRepository.getFriendsCount(userId);
    }

    /**
     * Find common friends between two users
     * @param userId1 - First user ID
     * @param userId2 - Second user ID
     * @returns Array of common friend IDs
     */
    async findCommonFriends(
        userId1: string,
        userId2: string
    ): Promise<string[]> {
        this.validateId(userId1, 'User 1 ID');
        this.validateId(userId2, 'User 2 ID');
        return await this.friendshipRepository.findCommonFriends(
            userId1,
            userId2
        );
    }
}
