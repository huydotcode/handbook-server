import { AppError, NotFoundError } from '../common/errors/app.error';
import { HTTP_STATUS } from '../common/constants/status-code';
import { IMessageModel } from '../models/message.model';
import { MessageRepository } from '../repositories/message.repository';
import { BaseService } from './base.service';
import Conversation from '../models/conversation.model';

/**
 * Service responsible for message-related business logic.
 */
export class MessageService extends BaseService<IMessageModel> {
    private messageRepository: MessageRepository;

    constructor() {
        const repository = new MessageRepository();
        super(repository);
        this.messageRepository = repository;
    }

    /**
     * Create a new message
     * @param data - Message data
     * @param userId - User ID performing the action
     * @returns Created message
     */
    async createMessage(data: any, userId: string) {
        // Validate required fields
        this.validateRequiredFields(data, ['sender', 'conversation']);

        // Set sender from userId
        data.sender = userId;

        return await this.create(data, userId);
    }

    /**
     * Get messages by conversation
     * @param conversationId - Conversation ID
     * @returns Array of messages
     */
    async getMessagesByConversation(conversationId: string) {
        this.validateId(conversationId);
        return await this.messageRepository.findManyWithSort(
            { conversation: conversationId },
            { createdAt: -1 }
        );
    }

    /**
     * Retrieve paginated messages for a conversation with access control.
     */
    async getConversationMessages(
        conversationId: string,
        userId: string,
        page: number,
        pageSize: number
    ) {
        await this.ensureConversationAccess(conversationId, userId);
        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );
        return await this.messageRepository.findPaginatedByFilter(
            { conversation: conversationId },
            currentPage,
            currentPageSize
        );
    }

    /**
     * Retrieve pinned messages for a conversation with pagination.
     */
    async getPinnedConversationMessages(
        conversationId: string,
        userId: string,
        page: number,
        pageSize: number
    ) {
        await this.ensureConversationAccess(conversationId, userId);
        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );
        return await this.messageRepository.findPaginatedByFilter(
            { conversation: conversationId, isPin: true },
            currentPage,
            currentPageSize
        );
    }

    /**
     * Search messages by keyword inside a conversation.
     */
    async searchConversationMessages(
        conversationId: string,
        keyword: string,
        userId: string
    ) {
        await this.ensureConversationAccess(conversationId, userId);
        if (!keyword || keyword.trim().length < 2) {
            throw new AppError(
                'Search keyword must be at least 2 characters',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        return await this.messageRepository.searchMessages(
            conversationId,
            keyword
        );
    }

    /**
     * Ensure the user participates in the conversation.
     */
    private async ensureConversationAccess(
        conversationId: string,
        userId: string
    ) {
        this.validateId(conversationId, 'Conversation ID');
        this.validateId(userId, 'User ID');

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: { $in: [userId] },
        })
            .lean()
            .exec();

        if (!conversation) {
            throw new NotFoundError(
                `Conversation not found or user is not a participant`
            );
        }

        return conversation;
    }

    /**
     * Pin a message
     * @param messageId - Message ID
     * @param userId - User ID
     * @returns Updated message
     */
    async pinMessage(messageId: string, userId: string) {
        this.validateId(messageId);

        const message = await this.messageRepository.findOneAndUpdate(
            { _id: messageId },
            { isPin: true }
        );

        if (!message) {
            throw new NotFoundError(`Message not found with id: ${messageId}`);
        }

        return message;
    }

    /**
     * Unpin a message
     * @param messageId - Message ID
     * @param userId - User ID
     * @returns Updated message
     */
    async unpinMessage(messageId: string, userId: string) {
        this.validateId(messageId);

        const message = await this.messageRepository.findOneAndUpdate(
            { _id: messageId },
            { isPin: false }
        );

        if (!message) {
            throw new NotFoundError(`Message not found with id: ${messageId}`);
        }

        return message;
    }

    /**
     * Mark message as read
     * @param messageId - Message ID
     * @param userId - User ID
     * @returns Updated message
     */
    async markAsRead(messageId: string, userId: string) {
        this.validateId(messageId);
        this.validateId(userId);

        const message = await this.messageRepository.findOneAndUpdate(
            { _id: messageId },
            {
                $addToSet: {
                    readBy: { user: userId, readAt: new Date() },
                },
            }
        );

        if (!message) {
            throw new NotFoundError(`Message not found with id: ${messageId}`);
        }

        return message;
    }
}
