import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { IFriendshipModel } from '../models/friendship.model';
import { ENotificationType } from '../models/notification.model';
import { FriendshipRepository } from '../repositories/friendship.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { UserRepository } from '../repositories/user.repository';
import { BaseService } from './base.service';

/**
 * Service responsible for friendship logic.
 */
export class FriendshipService extends BaseService<IFriendshipModel> {
    private friendshipRepository: FriendshipRepository;
    private userRepository: UserRepository;
    private notificationRepository: NotificationRepository;

    constructor() {
        const repository = new FriendshipRepository();
        super(repository);
        this.friendshipRepository = repository;
        this.userRepository = new UserRepository();
        this.notificationRepository = new NotificationRepository();
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

    /**
     * Get friend suggestions for a user
     * @param userId - User ID
     * @param limit - Maximum number of suggestions to return
     * @returns Array of suggested users
     */
    async getFriendSuggestions(userId: string, limit: number = 5) {
        this.validateId(userId, 'User ID');

        // Get IDs of current friends
        const friendIds = await this.friendshipRepository.getFriendIds(userId);

        // Get IDs of users with pending friend requests (both sent and received)
        const sentRequests = await this.notificationRepository.findMany({
            sender: userId,
            type: ENotificationType.REQUEST_ADD_FRIEND,
            isDeleted: false,
        });
        const receivedRequests = await this.notificationRepository.findMany({
            receiver: userId,
            type: ENotificationType.REQUEST_ADD_FRIEND,
            isDeleted: false,
        });

        const pendingIds = [
            ...sentRequests.map((n: any) => n.receiver.toString()),
            ...receivedRequests.map((n: any) => n.sender.toString()),
        ];

        // Exclude self, current friends, and pending request users
        const excludeIds = [...new Set([...friendIds, userId, ...pendingIds])];

        // Fetch paginated using UserRepository, taking newest active users
        const result = await this.userRepository.findPaginated(
            1,
            limit,
            { _id: { $nin: excludeIds } },
            { createdAt: -1 }
        );

        return result.data;
    }
}
