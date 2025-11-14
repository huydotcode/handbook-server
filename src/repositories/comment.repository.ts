import Comment, { ICommentModel } from '../models/comment.model';
import { BaseRepository } from './base.repository';

export class CommentRepository extends BaseRepository<ICommentModel> {
    constructor() {
        super(Comment);
    }

    /**
     * Find comments by post with pagination
     * @param postId - Post ID
     * @param page - Page number
     * @param pageSize - Page size
     * @returns Paginated comments
     */
    async findByPostWithPagination(
        postId: string,
        page: number = 1,
        pageSize: number = 10
    ) {
        const skip = (page - 1) * pageSize;

        const [data, total] = await Promise.all([
            this.model
                .find({
                    post: postId,
                    replyComment: null,
                    isDeleted: false,
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .populate('author', 'name username avatar')
                .populate('loves', 'name username avatar')
                .lean(),
            this.model.countDocuments({
                post: postId,
                replyComment: null,
                isDeleted: false,
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
     * Find reply comments with pagination
     * @param commentId - Parent comment ID
     * @param page - Page number
     * @param pageSize - Page size
     * @returns Paginated reply comments
     */
    async findRepliesWithPagination(
        commentId: string,
        page: number = 1,
        pageSize: number = 10
    ) {
        const skip = (page - 1) * pageSize;

        const [data, total] = await Promise.all([
            this.model
                .find({
                    replyComment: commentId,
                    isDeleted: false,
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .populate('author', 'name username avatar')
                .populate('loves', 'name username avatar')
                .lean(),
            this.model.countDocuments({
                replyComment: commentId,
                isDeleted: false,
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
     * Count comments by post
     * @param postId - Post ID
     * @returns Total comment count
     */
    async countByPost(postId: string) {
        return await this.model.countDocuments({
            post: postId,
            isDeleted: false,
        });
    }

    /**
     * Count replies to a comment
     * @param commentId - Comment ID
     * @returns Total reply count
     */
    async countReplies(commentId: string) {
        return await this.model.countDocuments({
            replyComment: commentId,
            isDeleted: false,
        });
    }

    /**
     * Add love to comment
     * @param commentId - Comment ID
     * @param userId - User ID
     * @returns Updated comment
     */
    async addLove(commentId: string, userId: string) {
        return await this.model
            .findByIdAndUpdate(
                commentId,
                { $addToSet: { loves: userId } },
                { new: true }
            )
            .lean();
    }

    /**
     * Remove love from comment
     * @param commentId - Comment ID
     * @param userId - User ID
     * @returns Updated comment
     */
    async removeLove(commentId: string, userId: string) {
        return await this.model
            .findByIdAndUpdate(
                commentId,
                { $pull: { loves: userId } },
                { new: true }
            )
            .lean();
    }
}
