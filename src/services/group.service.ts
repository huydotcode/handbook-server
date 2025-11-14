import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { IGroupModel, EGroupUserRole } from '../models/group.model';
import { GroupRepository } from '../repositories/group.repository';
import { BaseService } from './base.service';

/**
 * Service handling business logic for groups.
 */
export class GroupService extends BaseService<IGroupModel> {
    private groupRepository: GroupRepository;

    constructor() {
        const repository = new GroupRepository();
        super(repository);
        this.groupRepository = repository;
    }

    /**
     * Create a new group
     * @param data - Group data
     * @param userId - User ID creating the group
     * @returns Created group
     */
    async createGroup(data: any, userId: string) {
        // Validate required fields
        this.validateRequiredFields(data, ['name', 'description']);

        // Set creator
        data.creator = userId;

        // Add creator as admin member
        if (!data.members || data.members.length === 0) {
            data.members = [
                {
                    user: userId,
                    role: EGroupUserRole.ADMIN,
                },
            ];
        }

        return await this.create(data, userId);
    }

    /**
     * Update group by ID
     * @param id - Group ID
     * @param data - Update data
     * @param userId - User ID performing the action
     * @returns Updated group
     */
    async updateGroup(id: string, data: any, userId: string) {
        this.validateId(id);

        // Don't allow changing creator
        delete data.creator;

        // Update last activity
        data.lastActivity = new Date();

        return await this.update(id, data, userId);
    }

    /**
     * Get groups by creator
     * @param creatorId - Creator ID
     * @returns Array of groups
     */
    async getGroupsByCreator(creatorId: string) {
        this.validateId(creatorId, 'Creator ID');
        return await this.groupRepository.findManyWithSort(
            {
                creator: creatorId,
            },
            { createdAt: -1 }
        );
    }

    /**
     * Get groups by member
     * @param userId - User ID
     * @returns Array of groups
     */
    async getGroupsByMember(userId: string) {
        this.validateId(userId, 'User ID');
        return await this.groupRepository.findManyWithSort(
            {
                'members.user': userId,
            },
            { lastActivity: -1 }
        );
    }

    /**
     * Get group by ID with populated relations.
     */
    async getGroupByIdWithDetails(groupId: string) {
        this.validateId(groupId, 'Group ID');
        const group = await this.groupRepository.findByIdWithDetails(groupId);

        if (!group) {
            throw new NotFoundError(`Group not found with id: ${groupId}`);
        }

        return group;
    }

    /**
     * Get joined groups populated with members and creator.
     */
    async getJoinedGroups(userId: string) {
        this.validateId(userId, 'User ID');
        return await this.groupRepository.findJoinedGroups(userId);
    }

    /**
     * Search groups by name
     * @param searchTerm - Search term
     * @returns Array of groups
     */
    async searchGroups(searchTerm: string) {
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new AppError(
                'Search term must be at least 2 characters',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        return await this.groupRepository.findMany({
            $text: { $search: searchTerm },
        });
    }

    /**
     * Add member to group
     * @param groupId - Group ID
     * @param userId - User ID to add
     * @returns Updated group
     */
    async addMember(groupId: string, userId: string) {
        this.validateId(groupId);
        this.validateId(userId, 'User ID');

        const group = await this.groupRepository.findOneAndUpdate(
            { _id: groupId },
            {
                $addToSet: {
                    members: { user: userId, role: 'MEMBER' },
                },
                $set: { lastActivity: new Date() },
            }
        );

        if (!group) {
            throw new NotFoundError(`Group not found with id: ${groupId}`);
        }

        return group;
    }

    /**
     * Remove member from group
     * @param groupId - Group ID
     * @param userId - User ID to remove
     * @returns Updated group
     */
    async removeMember(groupId: string, userId: string) {
        this.validateId(groupId);
        this.validateId(userId, 'User ID');

        const group = await this.groupRepository.findOneAndUpdate(
            { _id: groupId },
            {
                $pull: {
                    members: { user: userId },
                },
                $set: { lastActivity: new Date() },
            }
        );

        if (!group) {
            throw new NotFoundError(`Group not found with id: ${groupId}`);
        }

        return group;
    }

    /**
     * Update member role
     * @param groupId - Group ID
     * @param userId - User ID
     * @param role - New role (MEMBER or ADMIN)
     * @returns Updated group
     */
    async updateMemberRole(
        groupId: string,
        userId: string,
        role: EGroupUserRole
    ) {
        this.validateId(groupId);
        this.validateId(userId);

        const group = await this.groupRepository.findOneAndUpdate(
            {
                _id: groupId,
                'members.user': userId,
            },
            {
                $set: {
                    'members.$.role': role,
                    lastActivity: new Date(),
                },
            }
        );

        if (!group) {
            throw new NotFoundError(`Group not found with id: ${groupId}`);
        }

        return group;
    }
}
