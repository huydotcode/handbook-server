import Friendship, { IFriendshipModel } from '../models/friendship.model';
import { BaseRepository } from './base.repository';
import { POPULATE_USER } from '../common/utils/populate';
import { Types } from 'mongoose';

/**
 * Repository for friendship relationships between users.
 */
export class FriendshipRepository extends BaseRepository<IFriendshipModel> {
    constructor() {
        super(Friendship);
    }

    /**
     * Find all friends of a user.
     * @param userId - The ID of the user
     * @returns Array of friendship documents with populated user data
     */
    async findFriendsOfUser(userId: string) {
        return await this.model
            .find({
                $or: [{ user1: userId }, { user2: userId }],
            })
            .populate('user1', POPULATE_USER)
            .populate('user2', POPULATE_USER)
            .sort({ createdAt: -1 })
            .lean();
    }

    /**
     * Get all friend IDs of a user.
     * @param userId - The ID of the user
     * @returns Array of friend user IDs
     */
    async getFriendIds(userId: string): Promise<string[]> {
        const friendships = await this.model
            .find({
                $or: [{ user1: userId }, { user2: userId }],
            })
            .select('user1 user2')
            .lean();

        return friendships.map((friendship) => {
            const userIdObj = new Types.ObjectId(userId);
            return friendship.user1.equals(userIdObj)
                ? friendship.user2.toString()
                : friendship.user1.toString();
        });
    }

    /**
     * Check if two users are friends.
     * @param userId1 - First user ID
     * @param userId2 - Second user ID
     * @returns true if they are friends, false otherwise
     */
    async areFriends(userId1: string, userId2: string): Promise<boolean> {
        const friendship = await this.model.findOne({
            $or: [
                { user1: userId1, user2: userId2 },
                { user1: userId2, user2: userId1 },
            ],
        });

        return !!friendship;
    }

    /**
     * Add two users as friends.
     * @param userId1 - First user ID
     * @param userId2 - Second user ID
     * @returns Created friendship document
     */
    async addFriend(userId1: string, userId2: string) {
        // Ensure consistent ordering (user1 < user2)
        const [user1, user2] = [userId1, userId2].sort();

        return await this.create({
            user1: new Types.ObjectId(user1),
            user2: new Types.ObjectId(user2),
        });
    }

    /**
     * Remove friendship between two users.
     * @param userId1 - First user ID
     * @param userId2 - Second user ID
     * @returns Deleted friendship document or null
     */
    async removeFriend(userId1: string, userId2: string) {
        return await this.model.findOneAndDelete({
            $or: [
                { user1: userId1, user2: userId2 },
                { user1: userId2, user2: userId1 },
            ],
        });
    }

    /**
     * Get count of friends for a user.
     * @param userId - The ID of the user
     * @returns Number of friends
     */
    async getFriendsCount(userId: string): Promise<number> {
        return await this.model.countDocuments({
            $or: [{ user1: userId }, { user2: userId }],
        });
    }

    /**
     * Find common friends between two users.
     * @param userId1 - First user ID
     * @param userId2 - Second user ID
     * @returns Array of common friend IDs
     */
    async findCommonFriends(
        userId1: string,
        userId2: string
    ): Promise<string[]> {
        const friends1 = await this.getFriendIds(userId1);
        const friends2 = await this.getFriendIds(userId2);

        const set1 = new Set(friends1);
        return friends2.filter((friendId) => set1.has(friendId));
    }
}
