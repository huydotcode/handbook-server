import { Types } from 'mongoose';
import Message, { IMessageModel } from '../models/message.model';
import { BaseRepository } from './base.repository';
import { POPULATE_USER } from '../common/utils/populate';
import { PaginationResult } from '../common/types/base';

/**
 * Repository layer encapsulating message persistence logic.
 */
export class MessageRepository extends BaseRepository<IMessageModel> {
    constructor() {
        super(Message);
    }

    /**
     * Find messages by filter with pagination metadata.
     * @param filter Mongo filter query
     * @param page Current page (1-based)
     * @param pageSize Number of items per page
     */
    async findPaginatedByFilter(
        filter: Record<string, any>,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IMessageModel>> {
        const skip = (page - 1) * pageSize;

        // Convert conversation to ObjectId if it's a string
        if (filter.conversation && typeof filter.conversation === 'string') {
            filter.conversation = new Types.ObjectId(filter.conversation);
        }

        const [messages, total] = await Promise.all([
            this.model
                .find(filter)
                .populate('sender', POPULATE_USER)
                .populate('conversation')
                .populate('media')
                .populate('readBy.user', POPULATE_USER)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            this.model.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
            data: messages,
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
     * Search messages within a conversation by keyword.
     * @param conversationId Conversation identifier
     * @param keyword Case-insensitive keyword
     */
    async searchMessages(
        conversationId: string,
        keyword: string
    ): Promise<IMessageModel[]> {
        return await this.model
            .find({
                conversation: new Types.ObjectId(conversationId),
                text: { $regex: keyword, $options: 'i' },
            })
            .populate('sender', POPULATE_USER)
            .populate('conversation')
            .populate('media')
            .populate('readBy.user', POPULATE_USER)
            .sort({ createdAt: -1 })
            .lean();
    }
}
