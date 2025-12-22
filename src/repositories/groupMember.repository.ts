import { Types } from 'mongoose';
import { PaginationResult } from '../common/types/base';
import GroupMember, { IGroupMemberModel } from '../models/groupMember.model';
import { BaseRepository } from './base.repository';
import { POPULATE_USER } from '../common/utils/populate';

/**
 * Repository encapsulating data access for group members.
 */
export class GroupMemberRepository extends BaseRepository<IGroupMemberModel> {
    constructor() {
        super(GroupMember);
    }

    /**
     * Find all members of a group with populated user details
     */
    async findGroupMembers(groupId: string): Promise<IGroupMemberModel[]> {
        return await this.model
            .find({ group: new Types.ObjectId(groupId) })
            .populate('user', POPULATE_USER)
            .sort({ joinedAt: -1 })
            .lean();
    }

    /**
     * Find a specific group member
     */
    async findGroupMember(
        groupId: string,
        userId: string
    ): Promise<IGroupMemberModel | null> {
        return await this.model
            .findOne({
                group: new Types.ObjectId(groupId),
                user: new Types.ObjectId(userId),
            })
            .populate('user', POPULATE_USER)
            .lean();
    }

    /**
     * Find all groups of a user
     */
    async findUserGroups(userId: string): Promise<IGroupMemberModel[]> {
        return await this.model
            .find({ user: new Types.ObjectId(userId) })
            .populate('group')
            .sort({ joinedAt: -1 })
            .lean();
    }

    /**
     * Check if user is member of a group
     */
    async isMember(groupId: string, userId: string): Promise<boolean> {
        const member = await this.model.countDocuments({
            group: new Types.ObjectId(groupId),
            user: new Types.ObjectId(userId),
        });
        return member > 0;
    }

    /**
     * Find members of a group with specific role
     */
    async findGroupMembersByRole(
        groupId: string,
        role: string
    ): Promise<IGroupMemberModel[]> {
        return await this.model
            .find({
                group: new Types.ObjectId(groupId),
                role: role,
            })
            .populate('user', POPULATE_USER)
            .lean();
    }

    /**
     * Count group members
     */
    async countGroupMembers(groupId: string): Promise<number> {
        return await this.model.countDocuments({
            group: new Types.ObjectId(groupId),
        });
    }

    /**
     * Get paginated members of a group
     */
    async findGroupMembersPaginated(
        groupId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IGroupMemberModel>> {
        const skip = (page - 1) * pageSize;

        const [members, total] = await Promise.all([
            this.model
                .find({ group: new Types.ObjectId(groupId) })
                .populate('user', POPULATE_USER)
                .sort({ joinedAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            this.model.countDocuments({
                group: new Types.ObjectId(groupId),
            }),
        ]);

        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
            data: members,
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

    /**
     * Remove all members of a group (when group is deleted)
     */
    async removeGroupMembers(groupId: string): Promise<any> {
        return await this.model.deleteMany({
            group: new Types.ObjectId(groupId),
        });
    }
}
