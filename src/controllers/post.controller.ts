import { NextFunction, Request, Response } from 'express';
import { PostService, PostInteractionService } from '../services';
import { ResponseUtil } from '../common/utils/response';
import {
    getPaginationParams,
    getAuthenticatedUserId,
    getOptionalUserId,
    validateRequiredParam,
    validateRequiredBodyField,
} from '../common/utils/controller.helper';
import { UnauthorizedError } from '../common/errors/app.error';
import { EPostStatus } from '../models/post.model';
import { EPostInteractionType } from '../models/post-interaction.model';

/**
 * Controller for post-related HTTP handlers.
 */
export class PostController {
    private postService: PostService;
    private postInteractionService: PostInteractionService;

    constructor() {
        this.postService = new PostService();
        this.postInteractionService = new PostInteractionService();
    }

    /**
     * POST /api/posts
     * Create a new post.
     */
    public createPost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const postData = req.body;
            const userId = getAuthenticatedUserId(req);
            validateRequiredBodyField(postData, 'author');

            const newPost = await this.postService.createPost(
                { ...postData, author: postData.author },
                userId
            );
            ResponseUtil.created(res, newPost, 'Post created successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/posts
     * Get all posts.
     */
    public getAllPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const posts = await this.postService.getAllPosts();
            ResponseUtil.success(res, posts, 'Posts retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/posts/:id
     * Get a post by ID with interaction flags.
     */
    public getPostById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const postId = req.params.id;
            validateRequiredParam(postId, 'Post ID');
            const userId = getOptionalUserId(req) || postId; // Fallback to postId if not authenticated

            const post = await this.postService.getPostById(postId, userId);
            ResponseUtil.success(res, post, 'Post retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/new-feed
     * Get new feed posts (from followings and friends).
     */
    public getNewFeedPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const { page, pageSize } = getPaginationParams(req, 3);

            const result = await this.postService.getNewFeedPosts(
                userId,
                page,
                pageSize
            );
            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'New feed posts retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/new-feed-friend
     * Get new feed posts from friends only.
     */
    public getNewFeedFriendPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const { page, pageSize } = getPaginationParams(req, 3);

            const result = await this.postService.getNewFeedFriendPosts(
                userId,
                page,
                pageSize
            );
            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Friend feed posts retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/new-feed-group
     * Get new feed posts from groups.
     */
    public getNewFeedGroupPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const { page, pageSize } = getPaginationParams(req, 3);

            const result = await this.postService.getNewFeedGroupPosts(
                userId,
                page,
                pageSize
            );
            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Group feed posts retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/profile/:userId
     * Get profile posts for a specific user.
     */
    public getProfilePosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.userId;
            validateRequiredParam(userId, 'User ID');
            const authenticatedUserId = getOptionalUserId(req) || userId;
            const { page, pageSize } = getPaginationParams(req, 3);

            const result = await this.postService.getPostsWithInteraction(
                {
                    author: userId,
                    group: null,
                    status: EPostStatus.ACTIVE,
                },
                authenticatedUserId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Profile posts retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/group/:groupId
     * Get posts for a specific group.
     */
    public getGroupPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const groupId = req.params.groupId;
            validateRequiredParam(groupId, 'Group ID');
            const { page, pageSize } = getPaginationParams(req, 3);

            const result = await this.postService.getPostsWithInteraction(
                {
                    group: groupId,
                    status: EPostStatus.ACTIVE,
                },
                userId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Group posts retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/group/:groupId/manage
     * Get manage group posts (active status).
     */
    public getManageGroupPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const groupId = req.params.groupId;
            validateRequiredParam(groupId, 'Group ID');
            const { page, pageSize } = getPaginationParams(req, 3);

            const result = await this.postService.getPostsWithInteraction(
                {
                    group: groupId,
                    status: EPostStatus.ACTIVE,
                },
                userId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Manage group posts retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/group/:groupId/manage/pending
     * Get manage group posts (pending status).
     */
    public getManageGroupPostsPending = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const groupId = req.params.groupId;
            validateRequiredParam(groupId, 'Group ID');
            const { page, pageSize } = getPaginationParams(req, 3);

            const result = await this.postService.getPostsWithInteraction(
                {
                    group: groupId,
                    status: EPostStatus.PENDING,
                },
                userId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Pending group posts retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/group/:groupId/member/:userId
     * Get posts by member in a group.
     */
    public getPostByMember = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.userId;
            const groupId = req.params.groupId;
            validateRequiredParam(userId, 'User ID');
            validateRequiredParam(groupId, 'Group ID');
            const authenticatedUserId = getOptionalUserId(req) || userId;
            const { page, pageSize } = getPaginationParams(req, 3);

            const result = await this.postService.getPostsWithInteraction(
                {
                    author: userId,
                    group: groupId,
                    status: EPostStatus.ACTIVE,
                },
                authenticatedUserId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Member posts retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/saved
     * Get saved posts for the authenticated user.
     */
    public getSavedPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const { page, pageSize } = getPaginationParams(req, 10);

            const result = await this.postService.getSavedPosts(
                userId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Saved posts retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/posts/:id/like
     * Toggle like on a post.
     */
    public likePost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const postId = req.params.id;
            validateRequiredParam(postId, 'Post ID');
            const userId = getAuthenticatedUserId(req);

            const result = await this.postInteractionService.toggleInteraction(
                postId,
                userId,
                EPostInteractionType.LOVE
            );

            ResponseUtil.success(
                res,
                result,
                result.action === 'added'
                    ? 'Post liked successfully'
                    : 'Post unliked successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/posts/:id/share
     * Toggle share on a post.
     */
    public sharePost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const postId = req.params.id;
            validateRequiredParam(postId, 'Post ID');
            const userId = getAuthenticatedUserId(req);

            const result = await this.postInteractionService.toggleInteraction(
                postId,
                userId,
                EPostInteractionType.SHARE
            );

            ResponseUtil.success(
                res,
                result,
                result.action === 'added'
                    ? 'Post shared successfully'
                    : 'Post unshared successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/posts/:id/save
     * Save a post.
     */
    public savePost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const postId = req.params.id;
            validateRequiredParam(postId, 'Post ID');
            const userId = getAuthenticatedUserId(req);

            const result = await this.postInteractionService.toggleInteraction(
                postId,
                userId,
                EPostInteractionType.SAVE
            );

            ResponseUtil.success(
                res,
                result,
                result.action === 'added'
                    ? 'Post saved successfully'
                    : 'Post unsaved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/posts/:id/save
     * Unsave a post.
     */
    public unsavePost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const postId = req.params.id;
            validateRequiredParam(postId, 'Post ID');
            const userId = getAuthenticatedUserId(req);

            // Check if post is saved
            const isSaved = await this.postInteractionService.hasUserInteracted(
                postId,
                userId,
                EPostInteractionType.SAVE
            );

            if (!isSaved) {
                ResponseUtil.success(
                    res,
                    { success: true },
                    'Post is not saved'
                );
                return;
            }

            await this.postInteractionService.toggleInteraction(
                postId,
                userId,
                EPostInteractionType.SAVE
            );

            ResponseUtil.success(
                res,
                { success: true },
                'Post unsaved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/posts/:id
     * Delete a post by ID.
     */
    public deletePost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const postId = req.params.id;
            validateRequiredParam(postId, 'Post ID');
            const userId = getAuthenticatedUserId(req);
            await this.postService.deletePost(postId, userId);
            ResponseUtil.success(
                res,
                { success: true },
                'Post deleted successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
