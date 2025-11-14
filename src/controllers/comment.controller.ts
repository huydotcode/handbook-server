import { NextFunction, Request, Response } from 'express';
import { CommentService } from '../services';
import { ResponseUtil } from '../common/utils/response';
import {
    getPaginationParams,
    getAuthenticatedUserId,
    validateRequiredParam,
} from '../common/utils/controller.helper';

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
            const userId = getAuthenticatedUserId(req);

            const comment = await this.commentService.createComment(
                commentData,
                userId
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
            const postId = req.params.postId;
            validateRequiredParam(postId, 'Post ID');
            const { page, pageSize } = getPaginationParams(req, 10);

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
            const commentId = req.params.commentId;
            validateRequiredParam(commentId, 'Comment ID');
            const { page, pageSize } = getPaginationParams(req, 10);

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
            const id = req.params.id;
            validateRequiredParam(id, 'Comment ID');

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
            const id = req.params.id;
            validateRequiredParam(id, 'Comment ID');
            const updateData = req.body;
            const userId = getAuthenticatedUserId(req);

            const comment = await this.commentService.updateComment(
                id,
                updateData,
                userId
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
            const id = req.params.id;
            validateRequiredParam(id, 'Comment ID');
            const userId = getAuthenticatedUserId(req);

            await this.commentService.deleteComment(id, userId);

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
            const id = req.params.id;
            validateRequiredParam(id, 'Comment ID');
            const userId = getAuthenticatedUserId(req);

            const comment = await this.commentService.addLoveToComment(
                id,
                userId
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
            const id = req.params.id;
            validateRequiredParam(id, 'Comment ID');
            const userId = getAuthenticatedUserId(req);

            const comment = await this.commentService.removeLoveFromComment(
                id,
                userId
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
            const postId = req.params.postId;
            validateRequiredParam(postId, 'Post ID');

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
