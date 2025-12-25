import { Types } from 'mongoose';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { IFollowsModel } from '../models/follow.model';
import { FollowRepository } from '../repositories/follow.repository';
import { BaseService } from './base.service';

/**
 * Service responsible for follower/following logic.
 */
export class FollowService extends BaseService<IFollowsModel> {
    private followRepository: FollowRepository;

    constructor() {
        const repository = new FollowRepository();
        super(repository);
        this.followRepository = repository;
    }

    /**
     * Follow a user
     * @param followerId - User ID who is following
     * @param followingId - User ID to follow
     * @param userId - User ID performing the action
     * @returns Created follow relationship
     */
    async followUser(followerId: string, followingId: string, userId: string) {
        this.validateId(followerId, 'Follower ID');
        this.validateId(followingId, 'Following ID');

        // Check if user is trying to follow themselves
        if (followerId === followingId) {
            throw new AppError(
                'Cannot follow yourself',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Check if already following
        const existingFollow = await this.followRepository.findOne({
            follower: followerId,
            following: followingId,
        });

        if (existingFollow) {
            throw new AppError(
                'Already following this user',
                HTTP_STATUS.CONFLICT
            );
        }

        return await this.create(
            {
                follower: new Types.ObjectId(followerId),
                following: new Types.ObjectId(followingId),
            },
            userId
        );
    }

    /**
     * Unfollow a user
     * @param followerId - User ID who is unfollowing
     * @param followingId - User ID to unfollow
     * @param userId - User ID performing the action
     * @returns True if unfollowed
     */
    async unfollowUser(
        followerId: string,
        followingId: string,
        userId: string
    ) {
        this.validateId(followerId, 'Follower ID');
        this.validateId(followingId, 'Following ID');

        const deleted = await this.followRepository.deleteMany({
            follower: followerId,
            following: followingId,
        });

        if (!deleted || deleted.deletedCount === 0) {
            throw new NotFoundError(
                `Follow relationship not found with followerId: ${followerId} and followingId: ${followingId}`
            );
        }

        return true;
    }

    /**
     * Get followers of a user
     * @param userId - User ID
     * @returns Array of followers
     */
    async getFollowers(userId: string) {
        this.validateId(userId, 'User ID');
        return await this.followRepository.findMany({
            following: userId,
        });
    }

    /**
     * Get users that a user is following
     * @param userId - User ID
     * @returns Array of following users
     */
    async getFollowing(userId: string) {
        this.validateId(userId, 'User ID');
        return await this.followRepository.findFollowings(userId);
    }

    /**
     * Check if user is following another user
     * @param followerId - Follower ID
     * @param followingId - Following ID
     * @returns True if following
     */
    async isFollowing(followerId: string, followingId: string) {
        this.validateId(followerId, 'Follower ID');
        this.validateId(followingId, 'Following ID');

        const follow = await this.followRepository.findOne({
            follower: followerId,
            following: followingId,
        });

        return !!follow;
    }

    /**
     * Get IDs of users that a user is following
     * @param userId - User ID
     * @returns Array of following user IDs
     */
    async getFollowingIds(userId: string): Promise<string[]> {
        this.validateId(userId, 'User ID');
        return await this.followRepository.findFollowingIds(userId);
    }
}
