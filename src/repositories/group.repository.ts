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
     * Find a group by ID with populated relations.
     */
    async findByIdWithDetails(id: string): Promise<IGroupModel | null> {
        return await this.model
            .findById(id)
            .populate('avatar')
            .populate('creator', POPULATE_USER)
            .populate('members.user', POPULATE_USER)
            .lean();
    }

    /**
     * Find groups the user has joined, sorted by latest activity.
     */
    async findJoinedGroups(userId: string): Promise<IGroupModel[]> {
        return await this.model
            .find({
                'members.user': userId,
            })
            .populate('avatar')
            .populate('creator', POPULATE_USER)
            .populate('members.user', POPULATE_USER)
            .sort({ lastActivity: -1 })
            .lean();
    }
}
