import User, { IUserModel } from '../models/user.model';
import { BaseRepository } from './base.repository';
import { POPULATE_USER } from '../common/utils/populate';

export class UserRepository extends BaseRepository<IUserModel> {
    constructor() {
        super(User);
    }

    /**
     * Find user by email
     * @param email User email
     * @returns User document
     */
    async findByEmail(email: string) {
        return await this.model.findOne({ email: email.toLowerCase() });
    }

    /**
     * Find user by email or username
     * @param value User email or username
     * @returns User document
     */
    async findByEmailOrUsername(value: string) {
        return await this.model.findOne({
            $or: [
                { email: value.toLowerCase() },
                { username: value.toLowerCase() },
            ],
        });
    }

    /**
     * Retrieve users with pagination metadata.
     * @param page Current page (1-based index)
     * @param pageSize Number of users per page
     */
    async findPaginated(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;

        const [users, total] = await Promise.all([
            User.find({}).skip(skip).limit(pageSize),
            User.countDocuments(),
        ]);

        return {
            data: users,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
                hasNext: page < Math.ceil(total / pageSize),
                hasPrev: page > 1,
            },
        };
    }

    /**
     * Get populated list of a user's friends.
     * @param userId User identifier
     */
    async findUserFriends(userId: string) {
        const user = await User.findById(userId).populate(
            'friends',
            POPULATE_USER
        );
        return user?.friends ?? [];
    }
}
