import { Types } from 'mongoose';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { PaginationResult } from '../common/types/base';
import {
    EGroupUserRole,
    IGroupMember,
    IGroupModel,
} from '../models/group.model';
import { GroupRepository } from '../repositories/group.repository';
import { UserRepository } from '../repositories/user.repository';
import { BaseService } from './base.service';

/**
 * Service handling business logic for groups.
 */
export class GroupService extends BaseService<IGroupModel> {
    private groupRepository: GroupRepository;
    private userRepository: UserRepository;

    constructor() {
        const repository = new GroupRepository();
        super(repository);
        this.groupRepository = repository;
        this.userRepository = new UserRepository();
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

        // Verify user exists
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError(`User not found with id: ${userId}`);
        }

        // Set creator
        data.creator = new Types.ObjectId(userId);

        // Convert members array if provided
        if (data.members && Array.isArray(data.members)) {
            data.members = data.members.map((member: any) => ({
                user: new Types.ObjectId(
                    typeof member === 'string' ? member : member.user || member
                ),
                role:
                    typeof member === 'object' && member.role
                        ? member.role
                        : EGroupUserRole.MEMBER,
            }));
        }

        // Add creator as admin member if not already in members
        const creatorInMembers = data.members?.some(
            (m: IGroupMember) =>
                (typeof m.user === 'string' ? m.user : m.user.toString()) ===
                userId
        );

        if (!creatorInMembers) {
            if (!data.members) {
                data.members = [];
            }
            data.members.push({
                user: new Types.ObjectId(userId),
                role: EGroupUserRole.ADMIN,
            });
        } else {
            // Ensure creator is ADMIN
            data.members = data.members.map((m: IGroupMember) => {
                const memberUserId =
                    typeof m.user === 'string' ? m.user : m.user.toString();
                if (memberUserId === userId) {
                    return {
                        ...m,
                        user: new Types.ObjectId(userId),
                        role: EGroupUserRole.ADMIN,
                    };
                }
                return {
                    ...m,
                    user:
                        typeof m.user === 'string'
                            ? new Types.ObjectId(m.user)
                            : m.user,
                };
            });
        }

        // Set default values
        if (!data.avatar) {
            throw new AppError('Avatar is required', HTTP_STATUS.BAD_REQUEST);
        }
        if (typeof data.avatar === 'string') {
            data.avatar = new Types.ObjectId(data.avatar);
        }

        if (!data.coverPhoto) {
            data.coverPhoto = '/assets/img/cover-page.jpg';
        }

        if (!data.type) {
            data.type = 'public';
        }

        const group = await this.create(data, userId);

        // Update user's groups list with actual group ID
        await this.userRepository.update(userId, {
            $addToSet: { groups: new Types.ObjectId(group._id) },
        });

        return group;
    }

    /**
     * Update group by ID
     * @param id - Group ID
     * @param data - Update data
     * @param userId - User ID performing the action
     * @returns Updated group
     */
    async updateGroup(id: string, data: any, userId: string) {
        this.validateId(id, 'Group ID');
        this.validateId(userId, 'User ID');

        // Get group and verify user is creator or admin
        const group = await this.getByIdOrThrow(id);
        await this.verifyAdminOrCreator(group, userId);

        // Don't allow changing creator or members directly
        delete data.creator;
        delete data.members;

        // Update last activity
        data.lastActivity = new Date();

        const updated = await this.update(id, data, userId);
        if (!updated) {
            throw new NotFoundError(`Group not found with id: ${id}`);
        }

        return updated;
    }

    /**
     * Delete group by ID (only creator can delete)
     * @param id - Group ID
     * @param userId - User ID performing the action
     * @returns True if deleted
     */
    async deleteGroup(id: string, userId: string): Promise<boolean> {
        this.validateId(id, 'Group ID');
        this.validateId(userId, 'User ID');

        // Get group and verify user is creator
        const group = await this.getByIdOrThrow(id);

        const creatorId =
            typeof group.creator === 'string'
                ? group.creator
                : group.creator.toString();
        if (creatorId !== userId) {
            throw new AppError(
                'Only the creator can delete this group',
                HTTP_STATUS.FORBIDDEN
            );
        }

        // Remove group from all members' groups list
        const memberIds = (group.members || []).map((m) =>
            typeof m.user === 'string' ? m.user : m.user.toString()
        );

        if (memberIds.length > 0) {
            await this.userRepository.updateMany(
                { _id: { $in: memberIds.map((id) => new Types.ObjectId(id)) } },
                { $pull: { groups: new Types.ObjectId(id) } }
            );
        }

        // Delete group
        const deleted = await this.delete(id, userId);
        if (!deleted) {
            throw new NotFoundError(`Group not found with id: ${id}`);
        }

        return true;
    }

    /**
     * Join group (add user as member)
     * @param groupId - Group ID
     * @param userId - User ID to join
     * @returns Updated group
     */
    async joinGroup(groupId: string, userId: string) {
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');

        // Verify group exists
        const group = await this.getByIdOrThrow(groupId);

        // Check if user is already a member
        const isMember = (group.members || []).some((m) => {
            const memberUserId =
                typeof m.user === 'string' ? m.user : m.user.toString();
            return memberUserId === userId;
        });

        if (isMember) {
            throw new AppError(
                'User is already a member of this group',
                HTTP_STATUS.CONFLICT
            );
        }

        // Add user to group members
        const updated = await this.groupRepository.findOneAndUpdate(
            { _id: groupId },
            {
                $addToSet: {
                    members: {
                        user: new Types.ObjectId(userId),
                        role: EGroupUserRole.MEMBER,
                    },
                },
                $set: { lastActivity: new Date() },
            }
        );

        if (!updated) {
            throw new NotFoundError(`Group not found with id: ${groupId}`);
        }

        // Add group to user's groups list
        await this.userRepository.update(userId, {
            $addToSet: { groups: new Types.ObjectId(groupId) },
        });

        return updated;
    }

    /**
     * Leave group (remove user from members)
     * @param groupId - Group ID
     * @param userId - User ID to leave
     * @returns Updated group
     */
    async leaveGroup(groupId: string, userId: string) {
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');

        // Verify group exists
        const group = await this.getByIdOrThrow(groupId);

        // Check if user is creator
        const creatorId =
            typeof group.creator === 'string'
                ? group.creator
                : group.creator.toString();
        if (creatorId === userId) {
            throw new AppError(
                'Creator cannot leave the group. Please delete the group instead.',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Check if user is a member
        const isMember = (group.members || []).some((m) => {
            const memberUserId =
                typeof m.user === 'string' ? m.user : m.user.toString();
            return memberUserId === userId;
        });

        if (!isMember) {
            throw new AppError(
                'User is not a member of this group',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Remove user from group members
        const updated = await this.groupRepository.findOneAndUpdate(
            { _id: groupId },
            {
                $pull: {
                    members: { user: new Types.ObjectId(userId) },
                },
                $set: { lastActivity: new Date() },
            }
        );

        if (!updated) {
            throw new NotFoundError(`Group not found with id: ${groupId}`);
        }

        // Remove group from user's groups list
        await this.userRepository.update(userId, {
            $pull: { groups: new Types.ObjectId(groupId) },
        });

        return updated;
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
                creator: new Types.ObjectId(creatorId),
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
                'members.user': new Types.ObjectId(userId),
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
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');

        const group = await this.groupRepository.findOneAndUpdate(
            { _id: groupId },
            {
                $addToSet: {
                    members: {
                        user: new Types.ObjectId(userId),
                        role: EGroupUserRole.MEMBER,
                    },
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
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');

        const group = await this.groupRepository.findOneAndUpdate(
            { _id: groupId },
            {
                $pull: {
                    members: { user: new Types.ObjectId(userId) },
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
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');

        const group = await this.groupRepository.findOneAndUpdate(
            {
                _id: groupId,
                'members.user': new Types.ObjectId(userId),
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

    /**
     * Verify user is admin or creator of the group
     * @param group - Group
     * @param userId - User ID
     */
    private async verifyAdminOrCreator(
        group: IGroupModel,
        userId: string
    ): Promise<void> {
        const creatorId =
            typeof group.creator === 'string'
                ? group.creator
                : group.creator.toString();

        if (creatorId === userId) {
            return; // Creator has all permissions
        }

        // Check if user is admin
        const isAdmin = (group.members || []).some((m) => {
            const memberUserId =
                typeof m.user === 'string' ? m.user : m.user.toString();
            return memberUserId === userId && m.role === EGroupUserRole.ADMIN;
        });

        if (!isAdmin) {
            throw new AppError(
                'Only admins or creator can perform this action',
                HTTP_STATUS.FORBIDDEN
            );
        }
    }

    /**
     * Get group members with pagination
     * @param groupId - Group ID
     * @param page - Page number
     * @param pageSize - Page size
     * @returns Paginated members
     */
    async getGroupMembers(
        groupId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IGroupMember>> {
        this.validateId(groupId, 'Group ID');
        this.validatePagination(page, pageSize);

        const group = await this.getByIdOrThrow(groupId);
        const members = group.members || [];

        // Paginate manually
        const skip = (page - 1) * pageSize;
        const paginatedMembers = members.slice(skip, skip + pageSize);
        const total = members.length;
        const totalPages = Math.ceil(total / pageSize) || 1;

        // Populate user data for members
        const populatedMembers = await Promise.all(
            paginatedMembers.map(async (member) => {
                const userId =
                    typeof member.user === 'string'
                        ? member.user
                        : member.user.toString();
                const user = await this.userRepository.findById(userId);
                return {
                    ...member,
                    user: user || member.user,
                };
            })
        );

        return {
            data: populatedMembers as IGroupMember[],
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
     * Get recommended groups for a user
     * @param userId - User ID
     * @returns Array of recommended groups
     */
    async getRecommendedGroups(userId: string): Promise<IGroupModel[]> {
        this.validateId(userId, 'User ID');

        // Get user's joined groups
        const joinedGroups = await this.getJoinedGroups(userId);
        const joinedGroupIds = joinedGroups.map((g) => g._id.toString());

        // Get groups that user is not a member of
        const allGroups = await this.groupRepository.findManyWithSort(
            {
                _id: {
                    $nin:
                        joinedGroupIds.length > 0
                            ? joinedGroupIds.map((id) => new Types.ObjectId(id))
                            : [],
                },
                type: 'public', // Only public groups
            },
            { createdAt: -1 } // Sort by creation date
        );

        const recommendedGroups = allGroups
            .sort((a, b) => {
                const aMembers = (a.members || []).length;
                const bMembers = (b.members || []).length;
                return bMembers - aMembers;
            })
            .slice(0, 10);

        return recommendedGroups;
    }

    /**
     * Update group cover photo
     * @param groupId - Group ID
     * @param coverPhoto - Cover photo URL
     * @param userId - User ID performing the action
     * @returns Updated group
     */
    async updateCoverPhoto(
        groupId: string,
        coverPhoto: string,
        userId: string
    ): Promise<IGroupModel> {
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');

        if (!coverPhoto || coverPhoto.trim().length === 0) {
            throw new AppError(
                'Cover photo is required',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Get group and verify user is admin or creator
        const group = await this.getByIdOrThrow(groupId);
        await this.verifyAdminOrCreator(group, userId);

        const updated = await this.update(
            groupId,
            {
                coverPhoto,
                lastActivity: new Date(),
            },
            userId
        );

        if (!updated) {
            throw new NotFoundError(`Group not found with id: ${groupId}`);
        }

        return updated;
    }

    /**
     * Update group avatar
     * @param groupId - Group ID
     * @param avatar - Avatar media ID
     * @param userId - User ID performing the action
     * @returns Updated group
     */
    async updateAvatar(
        groupId: string,
        avatar: string,
        userId: string
    ): Promise<IGroupModel> {
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');

        if (!avatar || avatar.trim().length === 0) {
            throw new AppError('Avatar is required', HTTP_STATUS.BAD_REQUEST);
        }

        // Get group and verify user is admin or creator
        const group = await this.getByIdOrThrow(groupId);
        await this.verifyAdminOrCreator(group, userId);

        const updated = await this.update(
            groupId,
            {
                avatar: new Types.ObjectId(avatar),
                lastActivity: new Date(),
            },
            userId
        );

        if (!updated) {
            throw new NotFoundError(`Group not found with id: ${groupId}`);
        }

        return updated;
    }

    /**
     * Get all groups with pagination (admin only)
     * @param page - Page number
     * @param pageSize - Page size
     * @returns Paginated groups
     */
    async getAllGroups(
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IGroupModel>> {
        this.validatePagination(page, pageSize);
        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        return await this.groupRepository.findAllPaginated(
            currentPage,
            currentPageSize
        );
    }
}
