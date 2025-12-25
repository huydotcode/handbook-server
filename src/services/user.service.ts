import bcrypt from 'bcrypt';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { PaginationResult } from '../common/types/base';
import { IUserModel } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { BaseService } from './base.service';
import { FriendshipService } from './friendship.service';

export class UserService extends BaseService<IUserModel> {
    private userRepository: UserRepository;

    constructor() {
        const repository = new UserRepository();
        super(repository);
        this.userRepository = repository;
    }

    /**
     * Create a new user.
     */
    async createUser(
        data: Partial<IUserModel>,
        userId: string
    ): Promise<IUserModel> {
        // Validate required fields
        this.validateRequiredFields(data, ['email', 'name', 'avatar']);

        // Validate email format
        if (data.email) {
            this.validateEmail(data.email);
        }

        // Hash password if provided
        if (data.password) {
            this.validateFieldLength(data.password, 'password', 6, 50);
            data.password = await bcrypt.hash(data.password, 10);
        }

        return await this.create(data, userId);
    }

    /**
     * Update an existing user.
     */
    async updateUser(
        id: string,
        data: Partial<IUserModel>,
        userId: string
    ): Promise<IUserModel> {
        this.validateId(id);

        // Hash password if being updated
        if (data.password) {
            this.validateFieldLength(data.password, 'password', 6, 50);
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updated = await this.update(id, data, userId);
        if (!updated) {
            throw new NotFoundError(`User not found with id: ${id}`);
        }

        return updated;
    }

    /**
     * Retrieve user by email.
     */
    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            throw new NotFoundError(`User not found with email: ${email}`);
        }

        return user;
    }

    /**
     * Retrieve user by username.
     */
    async getUserByUsername(username: string) {
        const user = await this.userRepository.findOne({
            username: username.toLowerCase(),
        });

        if (!user) {
            throw new NotFoundError(
                `User not found with username: ${username}`
            );
        }

        return user;
    }

    /**
     * Search users via text index.
     */
    async searchUsers(searchTerm: string) {
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new AppError(
                'Search term must be at least 2 characters',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        return await this.userRepository.findMany({
            $text: { $search: searchTerm },
        });
    }

    /**
     * Verify password of a given user entity.
     */
    async verifyPassword(user: IUserModel, password: string): Promise<boolean> {
        if (!user.password) {
            return false;
        }
        return await bcrypt.compare(password, user.password);
    }

    /**
     * Get list of currently online users.
     */
    async getOnlineUsers() {
        return await this.userRepository.findMany({
            isOnline: true,
        });
    }

    /**
     * Retrieve users with pagination metadata.
     */
    async getUsersWithPagination(params: {
        page: number;
        pageSize: number;
    }): Promise<PaginationResult<IUserModel>> {
        this.validatePagination(params.page, params.pageSize);

        return await this.userRepository.findPaginated(
            params.page,
            params.pageSize
        );
    }

    /**
     * Retrieve friends for a given user using FriendshipService.
     * Note: This method is deprecated. Use FriendshipService instead.
     */
    async getUserFriends(userId?: string) {
        if (!userId) {
            throw new AppError('User ID is required', HTTP_STATUS.BAD_REQUEST);
        }

        this.validateId(userId);

        const friendshipService = new FriendshipService();
        return await friendshipService.getFriends(userId);
    }

    /**
     * Update user avatar
     * @param userId - User ID
     * @param avatar - Avatar URL or image ID
     * @param currentUserId - Current user ID
     * @returns Updated user
     */
    async updateAvatar(
        userId: string,
        avatar: string,
        currentUserId: string
    ): Promise<IUserModel> {
        this.validateId(userId, 'User ID');

        if (!avatar || avatar.trim().length === 0) {
            throw new AppError('Avatar is required', HTTP_STATUS.BAD_REQUEST);
        }

        return await this.updateUser(userId, { avatar }, currentUserId);
    }
}
