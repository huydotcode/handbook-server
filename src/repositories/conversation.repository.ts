import { Types } from 'mongoose';
import { PaginationResult } from '../common/types/base';
import { POPULATE_USER_ONLINE } from '../common/utils';
import ConversationMember from '../models/conversation-member.model';
import Conversation, { IConversationModel } from '../models/conversation.model';
import { BaseRepository } from './base.repository';

export class ConversationRepository extends BaseRepository<IConversationModel> {
    constructor() {
        super(Conversation);
    }

    /**
     * Find conversations by participant with pagination and populate
     * @param userId - User ID
     * @param page - Page number
     * @param pageSize - Page size
     * @returns Paginated conversations
     */
    async findByParticipantWithPagination(
        userId: string,
        page: number = 1,
        pageSize: number = 20
    ) {
        const skip = (page - 1) * pageSize;

        const [data, total] = await Promise.all([
            this.model
                .find({
                    participants: { $elemMatch: { $eq: userId } },
                    isDeletedBy: { $ne: userId },
                })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .populate(
                    'participants',
                    'name username avatar lastAccessed isOnline'
                )
                .populate('creator', 'name username avatar')
                .populate({
                    path: 'lastMessage',
                    populate: [
                        {
                            path: 'sender',
                            select: 'name username avatar',
                        },
                        {
                            path: 'readBy.user',
                            select: 'name username avatar',
                        },
                    ],
                })
                .populate('avatar')
                .populate({
                    path: 'group',
                    populate: [
                        { path: 'avatar' },
                        {
                            path: 'members.user',
                            select: 'name username avatar',
                        },
                        { path: 'creator', select: 'name username avatar' },
                    ],
                })
                .lean(),
            this.model.countDocuments({
                participants: { $elemMatch: { $eq: userId } },
                isDeletedBy: { $ne: userId },
            }),
        ]);

        return {
            data,
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
     * Find conversation by ID with full populate
     * @param conversationId - Conversation ID
     * @returns Conversation with populated fields
     */
    async findByIdWithPopulate(conversationId: string) {
        return await this.model
            .findById(conversationId)
            .populate('creator', 'name username avatar')
            .populate({
                path: 'lastMessage',
                populate: [
                    {
                        path: 'sender',
                        select: 'name username avatar',
                    },
                    {
                        path: 'readBy.user',
                        select: 'name username avatar',
                    },
                ],
            })
            .populate('avatar')
            .populate({
                path: 'group',
                populate: [
                    { path: 'avatar' },
                    { path: 'members.user', select: 'name username avatar' },
                    { path: 'creator', select: 'name username avatar' },
                ],
            })
            .lean();
    }

    /**
     * Add participant to conversation
     * @param conversationId - Conversation ID
     * @param userId - User ID
     * @returns Updated conversation
     */
    async addParticipant(conversationId: string, userId: string) {
        return await this.model
            .findByIdAndUpdate(
                conversationId,
                { $addToSet: { participants: userId } },
                { new: true }
            )
            .lean();
    }

    /**
     * Remove participant from conversation
     * @param conversationId - Conversation ID
     * @param userId - User ID
     * @returns Updated conversation
     */
    async removeParticipant(conversationId: string, userId: string) {
        return await this.model
            .findByIdAndUpdate(
                conversationId,
                { $pull: { participants: userId } },
                { new: true }
            )
            .lean();
    }

    /**
     * Pin message in conversation
     * @param conversationId - Conversation ID
     * @param messageId - Message ID
     * @returns Updated conversation
     */
    async pinMessage(conversationId: string, messageId: string) {
        return await this.model
            .findByIdAndUpdate(
                conversationId,
                { $addToSet: { pinnedMessages: messageId } },
                { new: true }
            )
            .lean();
    }

    /**
     * Unpin message in conversation
     * @param conversationId - Conversation ID
     * @param messageId - Message ID
     * @returns Updated conversation
     */
    async unpinMessage(conversationId: string, messageId: string) {
        return await this.model
            .findByIdAndUpdate(
                conversationId,
                { $pull: { pinnedMessages: messageId } },
                { new: true }
            )
            .lean();
    }

    /**
     * Soft delete conversation for user
     * @param conversationId - Conversation ID
     * @param userId - User ID
     * @returns Updated conversation
     */
    async softDeleteForUser(conversationId: string, userId: string) {
        return await this.model
            .findByIdAndUpdate(
                conversationId,
                { $addToSet: { isDeletedBy: userId } },
                { new: true }
            )
            .lean();
    }

    /**
     * Update last message
     * @param conversationId - Conversation ID
     * @param messageId - Message ID
     * @returns Updated conversation
     */
    async updateLastMessage(conversationId: string, messageId: string | null) {
        return await this.model
            .findByIdAndUpdate(
                conversationId,
                { lastMessage: messageId },
                { new: true }
            )
            .lean();
    }

    /**
     * Check if user is participant
     * @param conversationId - Conversation ID
     * @param userId - User ID
     * @returns True if user is participant
     */
    async isParticipant(conversationId: string, userId: string) {
        const conversation = await this.model
            .findOne({
                _id: conversationId,
                participants: {
                    $elemMatch: { $eq: userId },
                },
            })
            .lean();
        return !!conversation;
    }

    /**
     * Find conversations by group ID with pagination
     * @param groupId - Group ID
     * @param page - Page number
     * @param pageSize - Page size
     * @returns Paginated conversations
     */
    async findByGroupWithPagination(
        groupId: string,
        page: number = 1,
        pageSize: number = 20
    ): Promise<PaginationResult<IConversationModel>> {
        const skip = (page - 1) * pageSize;

        const [data, total] = await Promise.all([
            this.model
                .find({
                    group: new Types.ObjectId(groupId),
                })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .populate('creator', 'name username avatar')
                .populate({
                    path: 'lastMessage',
                    populate: [
                        {
                            path: 'sender',
                            select: 'name username avatar',
                        },
                        {
                            path: 'readBy.user',
                            select: 'name username avatar',
                        },
                    ],
                })
                .populate('avatar')
                .populate({
                    path: 'group',
                    populate: [
                        { path: 'avatar' },
                        {
                            path: 'members.user',
                            select: 'name username avatar',
                        },
                        { path: 'creator', select: 'name username avatar' },
                    ],
                })
                .lean(),
            this.model.countDocuments({
                group: new Types.ObjectId(groupId),
            }),
        ]);

        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
            data: data as IConversationModel[],
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
     * Find private conversation between two users
     * @param userId1 - First user ID
     * @param userId2 - Second user ID
     * @returns Conversation or null
     */
    async findPrivateConversation(
        userId1: string,
        userId2: string
    ): Promise<IConversationModel | null> {
        try {
            // Find all conversations where both users are members
            const ConversationMember =
                this.model.db.model('ConversationMember');

            // Find conversation IDs where user1 is a member
            const user1Conversations = await ConversationMember.find({
                user: new Types.ObjectId(userId1),
            }).distinct('conversation');

            // Find conversation IDs where user2 is a member
            const user2Conversations = await ConversationMember.find({
                user: new Types.ObjectId(userId2),
            }).distinct('conversation');

            // Find common conversation IDs
            const commonConversations = user1Conversations.filter((id: any) =>
                user2Conversations.some((cid: any) => cid.equals(id))
            );

            // Find the private conversation
            const conversation = await this.model
                .findOne({
                    _id: { $in: commonConversations },
                    type: 'private',
                })
                .populate('creator', 'name username avatar')
                .populate({
                    path: 'lastMessage',
                    populate: [
                        {
                            path: 'sender',
                            select: 'name username avatar',
                        },
                        {
                            path: 'readBy.user',
                            select: 'name username avatar',
                        },
                    ],
                })
                .populate('avatar')
                .lean();

            return conversation || null;
        } catch (error) {
            console.error('Error finding private conversation:', error);
            return null;
        }
    }

    /**
     * Restore conversation (undelete) for user
     * @param conversationId - Conversation ID
     * @param userId - User ID
     * @returns Updated conversation
     */
    async restoreConversation(
        conversationId: string,
        userId: string
    ): Promise<IConversationModel | null> {
        return await this.model
            .findByIdAndUpdate(
                conversationId,
                { $pull: { isDeletedBy: new Types.ObjectId(userId) } },
                { new: true }
            )
            .populate('creator', 'name username avatar')
            .populate({
                path: 'lastMessage',
                populate: [
                    {
                        path: 'sender',
                        select: 'name username avatar',
                    },
                    {
                        path: 'readBy.user',
                        select: 'name username avatar',
                    },
                ],
            })
            .populate('avatar')
            .populate({
                path: 'group',
                populate: [
                    { path: 'avatar' },
                    {
                        path: 'members.user',
                        select: 'name username avatar',
                    },
                    { path: 'creator', select: 'name username avatar' },
                ],
            })
            .lean();
    }

    /**
     * Find conversations by member with pagination
     * @param userId - User ID
     * @param page - Page number
     * @param pageSize - Number of items per page
     * @returns Paginated conversations
     */
    async findByMemberWithPagination(
        userId: string,
        page: number = 1,
        pageSize: number = 20
    ) {
        const skip = (page - 1) * pageSize;
        const memberDocs = await ConversationMember.find({ user: userId })
            .select('conversation')
            .lean();
        const conversationIds = memberDocs.map((doc) => doc.conversation);
        const [data, total] = await Promise.all([
            this.model
                .find({
                    _id: { $in: conversationIds },
                    isDeletedBy: { $ne: userId },
                })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .populate('creator', 'name username avatar')
                .populate({
                    path: 'lastMessage',
                    populate: [
                        {
                            path: 'sender',
                            select: 'name username avatar',
                        },
                        {
                            path: 'readBy.user',
                            select: 'name username avatar',
                        },
                    ],
                })
                .populate('avatar')
                .populate({
                    path: 'group',
                    populate: [
                        { path: 'avatar' },
                        {
                            path: 'members.user',
                            select: 'name username avatar',
                        },
                        { path: 'creator', select: 'name username avatar' },
                    ],
                })
                .lean(),
            this.model.countDocuments({
                _id: { $in: conversationIds },
                isDeletedBy: { $ne: userId },
            }),
        ]);
        const fetchedConversationIds = (data as IConversationModel[]).map(
            (c) => c._id
        );

        const members = await ConversationMember.find({
            conversation: { $in: fetchedConversationIds },
        })
            .populate('user', POPULATE_USER_ONLINE)
            .lean();

        const conversationsWithMembers = (data as IConversationModel[]).map(
            (conversation) => {
                const conversationMembers = members.filter(
                    (m) =>
                        m.conversation.toString() ===
                        conversation._id.toString()
                );
                return { ...conversation, members: conversationMembers };
            }
        );

        return {
            data: conversationsWithMembers,
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
}
