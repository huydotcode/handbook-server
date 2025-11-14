import { NextFunction, Request, Response } from 'express';
import { CommentService } from '../services';
import { ResponseUtil } from '../common/utils/response';

export class CommentController {
    private commentService: CommentService;

    constructor() {
        this.commentService = new CommentService();
    }

    /**
     * POST /api/v1/comments
     * Create a new comment
     */
    public createComment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const commentData = req.body;
            const userId = req.user?.id;

            const comment = await this.commentService.createComment(
                commentData,
                userId as string
            );

            ResponseUtil.created(res, comment, 'Comment created successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/comments/post/:postId
     * Get comments by post with pagination
     */
    public getCommentsByPost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const postId = req.params.postId as string;
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 10;

            if (!postId) {
                return ResponseUtil.validationError(res, 'Post ID is required');
            }

            const result = await this.commentService.getCommentsByPost(postId, {
                page,
                pageSize,
            });

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Comments retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/comments/reply/:commentId
     * Get reply comments with pagination
     */
    public getReplyComments = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const commentId = req.params.commentId as string;
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 10;

            if (!commentId) {
                return ResponseUtil.validationError(
                    res,
                    'Comment ID is required'
                );
            }

            const result = await this.commentService.getReplyComments(
                commentId,
                {
                    page,
                    pageSize,
                }
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Reply comments retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/comments/:id
     * Get comment by ID
     */
    public getCommentById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const comment = await this.commentService.getCommentById(id);

            ResponseUtil.success(
                res,
                comment,
                'Comment retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/comments/:id
     * Update a comment
     */
    public updateComment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const userId = req.user?.id;

            const comment = await this.commentService.updateComment(
                id,
                updateData,
                userId as string
            );

            ResponseUtil.updated(res, comment, 'Comment updated successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/comments/:id
     * Delete a comment (soft delete)
     */
    public deleteComment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            await this.commentService.deleteComment(id, userId as string);

            ResponseUtil.deleted(res, 'Comment deleted successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/comments/:id/love
     * Add love to comment
     */
    public addLove = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const comment = await this.commentService.addLoveToComment(
                id,
                userId as string
            );

            ResponseUtil.success(res, comment, 'Love added successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/comments/:id/love
     * Remove love from comment
     */
    public removeLove = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const comment = await this.commentService.removeLoveFromComment(
                id,
                userId as string
            );

            ResponseUtil.success(res, comment, 'Love removed successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/comments/post/:postId/count
     * Count comments by post
     */
    public countCommentsByPost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const postId = req.params.postId as string;

            if (!postId) {
                return ResponseUtil.validationError(res, 'Post ID is required');
            }

            const count = await this.commentService.countCommentsByPost(postId);

            ResponseUtil.success(
                res,
                { count },
                'Comment count retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
