import { Types } from 'mongoose';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { PaginationResult } from '../common/types/base';
import { EGroupUserRole, IGroupModel } from '../models/group.model';
import { GroupRepository } from '../repositories/group.repository';
import { GroupMemberRepository } from '../repositories/group-member.repository';
import { UserRepository } from '../repositories/user.repository';
import { BaseService } from './base.service';
import { GroupMemberService } from './group-member.service';

/**
 * Service handling business logic for groups.
 */
export class GroupService extends BaseService<IGroupModel> {
    private groupRepository: GroupRepository;
    private groupMemberRepository: GroupMemberRepository;
    private groupMemberService: GroupMemberService;
    private userRepository: UserRepository;

    constructor() {
        const repository = new GroupRepository();
        super(repository);
        this.groupRepository = repository;
        this.groupMemberRepository = new GroupMemberRepository();
        this.groupMemberService = new GroupMemberService();
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

        // Extract members before schema validation (members are handled separately)
        const members = data.members;
        delete data.members;

        // Set creator
        data.creator = new Types.ObjectId(userId);

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

        // Add creator as ADMIN member
        await this.groupMemberService.addMember(
            group._id.toString(),
            userId,
            EGroupUserRole.ADMIN
        );

        // Optionally add initial members if provided
        if (members && Array.isArray(members) && members.length > 0) {
            const entries = members
                .map((m: any) => {
                    if (typeof m === 'string')
                        return { userId: m, role: EGroupUserRole.MEMBER };
                    if (typeof m === 'object') {
                        const userIdField = m.user || m.userId || m._id;
                        return {
                            userId: String(userIdField),
                            role: m.role || EGroupUserRole.MEMBER,
                        };
                    }
                    return null;
                })
                .filter(Boolean) as { userId: string; role: EGroupUserRole }[];

            // Avoid adding creator twice
            const filtered = entries.filter((e) => e.userId !== userId);

            await Promise.allSettled(
                filtered.map(async (e) => {
                    try {
                        await this.groupMemberService.addMember(
                            group._id.toString(),
                            e.userId,
                            e.role
                        );
                    } catch (_) {
                        // ignore individual failures
                    }
                })
            );
        }

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

        // Collect members before removal
        const members = await this.groupMemberRepository.findGroupMembers(id);
        // Remove all members from group
        await this.groupMemberService.removeGroupMembers(id);

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

        // Add user as member
        await this.groupMemberService.addMember(groupId, userId);

        // Update group last activity
        await this.update(groupId, { lastActivity: new Date() }, userId);

        return group;
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
        const isMember = await this.groupMemberService.isMember(
            groupId,
            userId
        );
        if (!isMember) {
            throw new AppError(
                'User is not a member of this group',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Remove user from group members
        await this.groupMemberService.removeMember(groupId, userId);

        // Update group last activity
        await this.update(groupId, { lastActivity: new Date() }, userId);

        // Remove group from user's groups list
        await this.userRepository.update(userId, {
            $pull: { groups: new Types.ObjectId(groupId) },
        });

        return group;
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
        return await this.groupMemberService.getUserGroups(userId);
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
        const memberships = await this.groupMemberRepository.findUserGroups(
            userId
        );
        // Map to groups; repository populated 'group'
        const groups = memberships
            .map((m) => (m as any).group)
            .filter(Boolean) as IGroupModel[];
        return groups;
    }

    /**
     * Check if user has access to a group
     * @param groupId - Group ID
     * @param userId - User ID (optional, for authenticated users)
     * @returns Object with hasAccess boolean
     */
    async checkUserAccess(
        groupId: string,
        userId?: string
    ): Promise<{ hasAccess: boolean }> {
        this.validateId(groupId, 'Group ID');

        const group = await this.groupRepository.findById(groupId);

        if (!group) {
            return { hasAccess: false };
        }

        // Public groups are accessible to all
        if (group.type === 'public') {
            return { hasAccess: true };
        }

        // Private groups require membership
        if (!userId) {
            return { hasAccess: false };
        }

        // Check if user is a member
        const member = await this.groupMemberService.getMember(groupId, userId);
        return { hasAccess: !!member };
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

        // Verify group exists
        const group = await this.getByIdOrThrow(groupId);

        // Add member via GroupMemberService
        await this.groupMemberService.addMember(groupId, userId);

        // Update group last activity
        await this.update(groupId, { lastActivity: new Date() }, userId);

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

        // Verify group exists
        const group = await this.getByIdOrThrow(groupId);

        // Remove member via GroupMemberService
        await this.groupMemberService.removeMember(groupId, userId);

        // Also remove group from user's groups list
        await this.userRepository.update(userId, {
            $pull: { groups: new Types.ObjectId(groupId) },
        });

        // Update group last activity
        await this.update(groupId, { lastActivity: new Date() }, userId);

        return group;
    }

    /**
     * Update member role
     * @param groupId - Group ID
     * @param userId - User ID
     * @param role - New role (MEMBER or ADMIN)
     * @returns Updated member
     */
    async updateMemberRole(
        groupId: string,
        userId: string,
        role: EGroupUserRole
    ) {
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');

        // Update member role via GroupMemberService
        const updated = await this.groupMemberService.updateMemberRole(
            groupId,
            userId,
            role
        );

        // Update group last activity
        await this.update(groupId, { lastActivity: new Date() }, userId);

        return updated;
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
        const member = await this.groupMemberService.getMember(
            group._id.toString(),
            userId
        );

        if (!member || member.role !== EGroupUserRole.ADMIN) {
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
    ): Promise<PaginationResult<any>> {
        this.validateId(groupId, 'Group ID');
        this.validatePagination(page, pageSize);

        return await this.groupMemberService.getGroupMembersPaginated(
            groupId,
            page,
            pageSize
        );
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
        const recommendedGroups =
            await this.groupRepository.findRecommendWithDetails(
                joinedGroupIds.length > 0
                    ? joinedGroupIds.map((id) => new Types.ObjectId(id))
                    : []
            );

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
