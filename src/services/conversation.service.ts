import { HTTP_STATUS } from '../common/constants/status-code';
import {
    AppError,
    ForbiddenError,
    NotFoundError,
} from '../common/errors/app.error';
import {
    IConversationInput,
    IConversationModel,
    EConversationType,
} from '../models/conversation.model';
import { ConversationRepository } from '../repositories/conversation.repository';
import { PaginationParams, PaginationResult } from '../common/types/base';
import { BaseService } from './base.service';

export class ConversationService extends BaseService<IConversationModel> {
    private conversationRepository: ConversationRepository;

    constructor() {
        const repository = new ConversationRepository();
        super(repository);
        this.conversationRepository = repository;
    }

    /**
     * Create a new conversation
     * @param data - Conversation data
     * @param userId - User ID creating the conversation
     * @returns Created conversation
     */
    async createConversation(
        data: Partial<IConversationInput>,
        userId: string
    ): Promise<IConversationModel> {
        try {
            // Validate required fields
            this.validateRequiredFields(data, ['participants']);

            // Set creator
            data.creator = userId as any;

            // Set default type if not provided
            if (!data.type) {
                data.type = EConversationType.PRIVATE;
            }

            const conversation = await this.create(data, userId);

            return conversation;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to create conversation: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get conversations by participant with pagination
     * @param userId - User ID
     * @param params - Pagination parameters
     * @returns Paginated conversations
     */
    async getConversationsByParticipant(
        userId: string,
        params: PaginationParams
    ): Promise<PaginationResult<IConversationModel>> {
        try {
            this.validateId(userId, 'User ID');

            const { page = 1, pageSize = 20 } = params;

            const result =
                await this.conversationRepository.findByParticipantWithPagination(
                    userId,
                    page,
                    pageSize
                );

            return result as PaginationResult<IConversationModel>;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to get conversations: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get conversation by ID
     * @param conversationId - Conversation ID
     * @param userId - User ID (for permission check)
     * @returns Conversation
     */
    async getConversationById(
        conversationId: string,
        userId: string
    ): Promise<IConversationModel> {
        try {
            this.validateId(conversationId, 'Conversation ID');

            const conversation =
                await this.conversationRepository.findByIdWithPopulate(
                    conversationId
                );

            if (!conversation) {
                throw new NotFoundError(
                    `Conversation not found with id: ${conversationId}`
                );
            }

            // Check if user is participant (for private conversations)
            if (conversation.type === EConversationType.PRIVATE) {
                const isParticipant =
                    await this.conversationRepository.isParticipant(
                        conversationId,
                        userId
                    );

                if (!isParticipant) {
                    throw new AppError(
                        'You do not have permission to access this conversation',
                        HTTP_STATUS.FORBIDDEN
                    );
                }
            }

            return conversation as IConversationModel;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to get conversation: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update a conversation
     * @param id - Conversation ID
     * @param data - Update data
     * @param userId - User ID performing the action
     * @returns Updated conversation
     */
    async updateConversation(
        id: string,
        data: Partial<IConversationInput>,
        userId: string
    ): Promise<IConversationModel> {
        try {
            this.validateId(id);

            const updated = await this.update(id, data, userId);
            if (!updated) {
                throw new NotFoundError(
                    `Conversation not found with id: ${id}`
                );
            }

            return updated;
        } catch (error) {
            if (error instanceof AppError || error instanceof NotFoundError) {
                throw error;
            }
            throw new AppError(
                `Failed to update conversation: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add participant to conversation
     * @param conversationId - Conversation ID
     * @param participantId - User ID to add
     * @param userId - User ID performing the action
     * @returns Updated conversation
     */
    async addParticipant(
        conversationId: string,
        participantId: string,
        userId: string
    ): Promise<IConversationModel> {
        try {
            this.validateId(conversationId, 'Conversation ID');
            this.validateId(participantId, 'Participant ID');

            // Check if requester is participant
            const isParticipant =
                await this.conversationRepository.isParticipant(
                    conversationId,
                    userId
                );

            if (!isParticipant) {
                throw new AppError(
                    'You do not have permission to add participants',
                    HTTP_STATUS.FORBIDDEN
                );
            }

            const conversation =
                await this.conversationRepository.addParticipant(
                    conversationId,
                    participantId
                );

            if (!conversation) {
                throw new NotFoundError(
                    `Conversation not found with id: ${conversationId}`
                );
            }

            return conversation as IConversationModel;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to add participant: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Remove participant from conversation
     * @param conversationId - Conversation ID
     * @param participantId - User ID to remove
     * @param userId - User ID performing the action
     * @returns Updated conversation
     */
    async removeParticipant(
        conversationId: string,
        participantId: string,
        userId: string
    ): Promise<IConversationModel> {
        try {
            this.validateId(conversationId, 'Conversation ID');
            this.validateId(participantId, 'Participant ID');

            const conversation =
                await this.conversationRepository.removeParticipant(
                    conversationId,
                    participantId
                );

            if (!conversation) {
                throw new NotFoundError(
                    `Conversation not found with id: ${conversationId}`
                );
            }

            return conversation as IConversationModel;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to remove participant: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Pin message in conversation
     * @param conversationId - Conversation ID
     * @param messageId - Message ID
     * @param userId - User ID performing the action
     * @returns Updated conversation
     */
    async pinMessage(
        conversationId: string,
        messageId: string,
        userId: string
    ): Promise<IConversationModel> {
        try {
            this.validateId(conversationId, 'Conversation ID');
            this.validateId(messageId, 'Message ID');

            // Check if user is participant
            const isParticipant =
                await this.conversationRepository.isParticipant(
                    conversationId,
                    userId
                );

            if (!isParticipant) {
                throw new ForbiddenError(
                    'You do not have permission to pin messages'
                );
            }

            const conversation = await this.conversationRepository.pinMessage(
                conversationId,
                messageId
            );

            if (!conversation) {
                throw new NotFoundError(
                    `Conversation not found with id: ${conversationId}`
                );
            }

            return conversation as IConversationModel;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to pin message: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Unpin message in conversation
     * @param conversationId - Conversation ID
     * @param messageId - Message ID
     * @param userId - User ID performing the action
     * @returns Updated conversation
     */
    async unpinMessage(
        conversationId: string,
        messageId: string,
        userId: string
    ): Promise<IConversationModel> {
        try {
            this.validateId(conversationId, 'Conversation ID');
            this.validateId(messageId, 'Message ID');

            const conversation = await this.conversationRepository.unpinMessage(
                conversationId,
                messageId
            );

            if (!conversation) {
                throw new NotFoundError(
                    `Conversation not found with id: ${conversationId}`
                );
            }

            return conversation as IConversationModel;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to unpin message: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Delete conversation for user (soft delete)
     * @param conversationId - Conversation ID
     * @param userId - User ID
     * @returns True if deleted
     */
    async deleteConversationForUser(
        conversationId: string,
        userId: string
    ): Promise<boolean> {
        try {
            this.validateId(conversationId, 'Conversation ID');

            const conversation =
                await this.conversationRepository.softDeleteForUser(
                    conversationId,
                    userId
                );

            if (!conversation) {
                throw new NotFoundError(
                    `Conversation not found with id: ${conversationId}`
                );
            }

            return true;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to delete conversation: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update last message
     * @param conversationId - Conversation ID
     * @param messageId - Message ID
     * @returns Updated conversation
     */
    async updateLastMessage(
        conversationId: string,
        messageId: string
    ): Promise<IConversationModel> {
        try {
            this.validateId(conversationId, 'Conversation ID');
            this.validateId(messageId, 'Message ID');

            const conversation =
                await this.conversationRepository.updateLastMessage(
                    conversationId,
                    messageId
                );

            if (!conversation) {
                throw new NotFoundError(
                    `Conversation not found with id: ${conversationId}`
                );
            }

            return conversation as IConversationModel;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to update last message: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }
}
