import { Types } from 'mongoose';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { PaginationResult } from '../common/types/base';
import {
    EGroupUserRole,
    IGroupMemberModel,
} from '../models/group-member.model';
import { GroupMemberRepository } from '../repositories/group-member.repository';
import { UserRepository } from '../repositories/user.repository';
import { BaseService } from './base.service';

/**
 * Service handling business logic for group members.
 */
export class GroupMemberService extends BaseService<IGroupMemberModel> {
    private memberRepository: GroupMemberRepository;
    private userRepository: UserRepository;

    constructor() {
        const repository = new GroupMemberRepository();
        super(repository);
        this.memberRepository = repository;
        this.userRepository = new UserRepository();
    }

    /**
     * Add member to group
     */
    async addMember(
        groupId: string,
        userId: string,
        role: EGroupUserRole = EGroupUserRole.MEMBER
    ): Promise<IGroupMemberModel> {
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');

        // Check user exists
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError(`User not found with id: ${userId}`);
        }

        // Check if already member
        const existingMember = await this.memberRepository.findGroupMember(
            groupId,
            userId
        );
        if (existingMember) {
            throw new AppError(
                'User is already a member of this group',
                HTTP_STATUS.CONFLICT
            );
        }

        // Create membership
        const memberData = {
            group: new Types.ObjectId(groupId),
            user: new Types.ObjectId(userId),
            role: role,
        };

        return await this.create(memberData, userId);
    }

    /**
     * Remove member from group
     */
    async removeMember(groupId: string, userId: string): Promise<boolean> {
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');

        const result = await this.memberRepository.findOneAndDelete({
            group: new Types.ObjectId(groupId),
            user: new Types.ObjectId(userId),
        });

        if (!result) {
            throw new NotFoundError(
                `Member not found in group with id: ${groupId}`
            );
        }

        return true;
    }

    /**
     * Update member role
     */
    async updateMemberRole(
        groupId: string,
        userId: string,
        role: EGroupUserRole
    ): Promise<IGroupMemberModel | null> {
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');

        if (!Object.values(EGroupUserRole).includes(role)) {
            throw new AppError(
                `Invalid role: ${role}`,
                HTTP_STATUS.BAD_REQUEST
            );
        }

        const updated = await this.memberRepository.findOneAndUpdate(
            {
                group: new Types.ObjectId(groupId),
                user: new Types.ObjectId(userId),
            },
            { role }
        );

        if (!updated) {
            throw new NotFoundError(
                `Member not found in group with id: ${groupId}`
            );
        }

        return updated;
    }

    /**
     * Get group members
     */
    async getGroupMembers(groupId: string): Promise<IGroupMemberModel[]> {
        this.validateId(groupId, 'Group ID');
        return await this.memberRepository.findGroupMembers(groupId);
    }

    /**
     * Get group members with pagination
     */
    async getGroupMembersPaginated(
        groupId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IGroupMemberModel>> {
        this.validateId(groupId, 'Group ID');
        this.validatePagination(page, pageSize);

        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        return await this.memberRepository.findGroupMembersPaginated(
            groupId,
            currentPage,
            currentPageSize
        );
    }

    /**
     * Get user groups (all groups a user is member of)
     */
    async getUserGroups(userId: string): Promise<IGroupMemberModel[]> {
        this.validateId(userId, 'User ID');
        return await this.memberRepository.findUserGroups(userId);
    }

    /**
     * Get user group IDs only (optimized for queries)
     */
    async getUserGroupIds(userId: string): Promise<string[]> {
        this.validateId(userId, 'User ID');
        return await this.memberRepository.findUserGroupIds(userId);
    }

    /**
     * Check if user is member of group
     */
    async isMember(groupId: string, userId: string): Promise<boolean> {
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');
        return await this.memberRepository.isMember(groupId, userId);
    }

    /**
     * Get member details
     */
    async getMember(
        groupId: string,
        userId: string
    ): Promise<IGroupMemberModel | null> {
        this.validateId(groupId, 'Group ID');
        this.validateId(userId, 'User ID');
        return await this.memberRepository.findGroupMember(groupId, userId);
    }

    /**
     * Count group members
     */
    async countGroupMembers(groupId: string): Promise<number> {
        this.validateId(groupId, 'Group ID');
        return await this.memberRepository.countGroupMembers(groupId);
    }

    /**
     * Get group admins
     */
    async getGroupAdmins(groupId: string): Promise<IGroupMemberModel[]> {
        this.validateId(groupId, 'Group ID');
        return await this.memberRepository.findGroupMembersByRole(
            groupId,
            EGroupUserRole.ADMIN
        );
    }

    /**
     * Remove all members of a group (when group is deleted)
     */
    async removeGroupMembers(groupId: string): Promise<void> {
        this.validateId(groupId, 'Group ID');
        await this.memberRepository.removeGroupMembers(groupId);
    }
}
