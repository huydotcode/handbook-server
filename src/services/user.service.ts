import bcrypt from 'bcrypt';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { IUserModel } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { BaseService } from './base.service';

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
    async createUser(data: any, userId: string) {
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
    async updateUser(id: string, data: any, userId: string) {
        this.validateId(id);

        // Hash password if being updated
        if (data.password) {
            this.validateFieldLength(data.password, 'password', 6, 50);
            data.password = await bcrypt.hash(data.password, 10);
        }

        return await this.update(id, data, userId);
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
    async getUsersWithPagination(params: { page: number; pageSize: number }) {
        const page = Math.max(1, params.page || 1);
        const pageSize = Math.max(1, params.pageSize || 10);

        const { data, pagination } = await this.userRepository.findPaginated(
            page,
            pageSize
        );

        return { data, pagination };
    }

    /**
     * Retrieve populated friends for a given user.
     */
    async getUserFriends(userId?: string) {
        if (!userId) {
            throw new AppError('User ID is required', HTTP_STATUS.BAD_REQUEST);
        }

        this.validateId(userId);

        const friends = await this.userRepository.findUserFriends(userId);
        return friends;
    }
}
