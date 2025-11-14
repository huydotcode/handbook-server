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
    async updateLastMessage(conversationId: string, messageId: string) {
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
}
