import { Types } from 'mongoose';
import { PaginationResult } from '../common/types/base';
import Group, { IGroupModel } from '../models/group.model';
import { BaseRepository } from './base.repository';
import { POPULATE_USER } from '../common/utils/populate';

/**
 * Repository encapsulating data access for groups.
 */
export class GroupRepository extends BaseRepository<IGroupModel> {
    constructor() {
        super(Group);
    }

    /**
     * Find recommended groups excluding those already joined by the user.
     */
    async findRecommendWithDetails(
        joinedGroupIds: Types.ObjectId[]
    ): Promise<IGroupModel[]> {
        return await this.model
            .find({ _id: { $nin: joinedGroupIds } })
            .populate('avatar')
            .populate('creator', POPULATE_USER)
            .sort({ lastActivity: -1 })
            .lean();
    }

    /**
     * Find a group by ID with populated relations.
     */
    async findByIdWithDetails(id: string): Promise<IGroupModel | null> {
        return await this.model
            .findById(id)
            .populate('avatar')
            .populate('creator', POPULATE_USER)
            .lean();
    }

    /**
     * Find all groups with pagination (admin only)
     */
    async findAllPaginated(
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IGroupModel>> {
        const skip = (page - 1) * pageSize;

        const [groups, total] = await Promise.all([
            this.model
                .find({})
                .populate('avatar')
                .populate('creator', POPULATE_USER)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            this.model.countDocuments({}),
        ]);

        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
            data: groups,
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
