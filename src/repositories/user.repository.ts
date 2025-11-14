import User, { IUserModel } from '../models/user.model';
import { BaseRepository } from './base.repository';
import { POPULATE_USER } from '../common/utils/populate';

export class UserRepository extends BaseRepository<IUserModel> {
    constructor() {
        super(User);
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
