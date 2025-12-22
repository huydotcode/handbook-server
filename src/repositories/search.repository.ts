import User, { IUserModel } from '../models/user.model';
import Group, { IGroupModel } from '../models/group.model';
import { PaginationResult } from '../common/types/base';
import { POPULATE_USER } from '../common/utils/populate';

/**
 * Repository layer to aggregate search queries across multiple collections.
 */
export class SearchRepository {
    /**
     * Search users by text query excluding the requester.
     */
    async searchUsers(
        query: string,
        excludeUserId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IUserModel>> {
        const skip = (page - 1) * pageSize;

        const filter = {
            $text: { $search: query },
            _id: { $ne: excludeUserId },
        };

        const [users, total] = await Promise.all([
            User.find(filter)
                .select(POPULATE_USER)
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(pageSize)
                .lean<IUserModel[]>(),
            User.countDocuments(filter),
        ]);

        return this.buildPaginationResult(users, total, page, pageSize);
    }

    /**
     * Search groups by text query, including only public groups or those the user joined.
     */
    async searchGroups(
        query: string,
        userId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IGroupModel>> {
        const skip = (page - 1) * pageSize;

        const filter = {
            $text: { $search: query },
            $or: [
                { type: 'public' },
                { members: { $elemMatch: { user: userId } } },
            ],
        };

        const [groups, total] = await Promise.all([
            Group.find(filter)
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(pageSize)
                .populate('avatar')
                .populate('creator', POPULATE_USER)
                .lean<IGroupModel[]>(),
            Group.countDocuments(filter),
        ]);

        return this.buildPaginationResult(groups, total, page, pageSize);
    }

    private buildPaginationResult<T>(
        data: T[],
        total: number,
        page: number,
        pageSize: number
    ): PaginationResult<T> {
        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
            data,
            pagination: {
                page,
                pageSize,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
}
