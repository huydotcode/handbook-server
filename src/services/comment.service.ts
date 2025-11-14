import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { ICommentModel, ICommentInput } from '../models/comment.model';
import { CommentRepository } from '../repositories/comment.repository';
import { BaseService } from './base.service';
import { PaginationParams, PaginationResult } from '../common/types/base';

export class CommentService extends BaseService<ICommentModel> {
    private commentRepository: CommentRepository;

    constructor() {
        const repository = new CommentRepository();
        super(repository);
        this.commentRepository = repository;
    }

    /**
     * Create a new comment
     * @param data - Comment data
     * @param userId - User ID performing the action
     * @returns Created comment
     */
    async createComment(
        data: Partial<ICommentInput>,
        userId: string
    ): Promise<ICommentModel> {
        try {
            // Validate required fields
            this.validateRequiredFields(data, ['text', 'post']);

            // Set author from userId
            data.author = userId as any;

            const comment = await this.create(data, userId);

            return comment;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to create comment: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get comments by post with pagination
     * @param postId - Post ID
     * @param params - Pagination parameters
     * @returns Paginated comments
     */
    async getCommentsByPost(
        postId: string,
        params: PaginationParams
    ): Promise<PaginationResult<ICommentModel>> {
        try {
            this.validateId(postId, 'Post ID');

            const { page = 1, pageSize = 10 } = params;

            const result =
                await this.commentRepository.findByPostWithPagination(
                    postId,
                    page,
                    pageSize
                );

            return result as PaginationResult<ICommentModel>;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to get comments: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get reply comments with pagination
     * @param commentId - Parent comment ID
     * @param params - Pagination parameters
     * @returns Paginated reply comments
     */
    async getReplyComments(
        commentId: string,
        params: PaginationParams
    ): Promise<PaginationResult<ICommentModel>> {
        try {
            this.validateId(commentId, 'Comment ID');

            const { page = 1, pageSize = 10 } = params;

            const result =
                await this.commentRepository.findRepliesWithPagination(
                    commentId,
                    page,
                    pageSize
                );

            return result as PaginationResult<ICommentModel>;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to get reply comments: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get comment by ID
     * @param id - Comment ID
     * @returns Comment
     */
    async getCommentById(id: string): Promise<ICommentModel> {
        try {
            this.validateId(id);
            return await this.getByIdOrThrow(id);
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to get comment: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update a comment
     * @param id - Comment ID
     * @param data - Update data
     * @param userId - User ID performing the action
     * @returns Updated comment
     */
    async updateComment(
        id: string,
        data: Partial<ICommentInput>,
        userId: string
    ): Promise<ICommentModel> {
        try {
            this.validateId(id);

            const updated = await this.update(id, data, userId);
            if (!updated) {
                throw new NotFoundError(`Comment not found with id: ${id}`);
            }

            return updated;
        } catch (error) {
            if (error instanceof AppError || error instanceof NotFoundError) {
                throw error;
            }
            throw new AppError(
                `Failed to update comment: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Soft delete comment
     * @param id - Comment ID
     * @param userId - User ID performing the action
     * @returns True if deleted
     */
    async deleteComment(id: string, userId: string): Promise<boolean> {
        try {
            this.validateId(id);

            const comment = await this.update(
                id,
                { isDeleted: true } as any,
                userId
            );

            if (!comment) {
                throw new NotFoundError(`Comment not found with id: ${id}`);
            }

            return true;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to delete comment: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add love to comment
     * @param commentId - Comment ID
     * @param userId - User ID
     * @returns Updated comment
     */
    async addLoveToComment(
        commentId: string,
        userId: string
    ): Promise<ICommentModel> {
        try {
            this.validateId(commentId, 'Comment ID');

            const comment = await this.commentRepository.addLove(
                commentId,
                userId
            );

            if (!comment) {
                throw new NotFoundError(
                    `Comment not found with id: ${commentId}`
                );
            }

            return comment as ICommentModel;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to add love to comment: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Remove love from comment
     * @param commentId - Comment ID
     * @param userId - User ID
     * @returns Updated comment
     */
    async removeLoveFromComment(
        commentId: string,
        userId: string
    ): Promise<ICommentModel> {
        try {
            this.validateId(commentId, 'Comment ID');

            const comment = await this.commentRepository.removeLove(
                commentId,
                userId
            );

            if (!comment) {
                throw new NotFoundError(
                    `Comment not found with id: ${commentId}`
                );
            }

            return comment as ICommentModel;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to remove love from comment: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Count comments by post
     * @param postId - Post ID
     * @returns Total comment count
     */
    async countCommentsByPost(postId: string): Promise<number> {
        try {
            this.validateId(postId);
            return await this.commentRepository.countByPost(postId);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to count comments: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Count replies to a comment
     * @param commentId - Comment ID
     * @returns Total reply count
     */
    async countReplies(commentId: string): Promise<number> {
        try {
            this.validateId(commentId, 'Comment ID');
            return await this.commentRepository.countReplies(commentId);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to count replies: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }
}
