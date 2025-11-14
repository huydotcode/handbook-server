import { NextFunction, Request, Response } from 'express';
import { PostService } from '../services';
import {
    getDecodedTokenFromHeaders,
    getDecodedTokenFromRequest,
} from '../common/utils/jwt';
import { ResponseUtil } from '../common/utils/response';
import { UnauthorizedError } from '../common/errors/app.error';
import { EPostStatus } from '../models/post.model';

/**
 * Controller for post-related HTTP handlers.
 */
export class PostController {
    private postService: PostService;

    constructor() {
        this.postService = new PostService();
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
            const newPost = await this.postService.createPost(
                postData,
                postData.author
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
            const post = await this.postService.getPostById(
                postId,
                req.user?.id as string
            );
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
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 3;

            const result = await this.postService.getNewFeedPosts(
                req.user?.id!,
                page,
                pageSize
            );
            ResponseUtil.success(
                res,
                result.data,
                'New feed posts retrieved successfully',
                200,
                result.pagination
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
            const userId = req.query.user_id as string;
            if (!userId) {
                throw new UnauthorizedError('User ID is required');
            }

            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 3;

            const result = await this.postService.getNewFeedFriendPosts(
                userId,
                page,
                pageSize
            );
            ResponseUtil.success(
                res,
                result.data,
                'Friend feed posts retrieved successfully',
                200,
                result.pagination
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
            const userId = req.query.user_id as string;
            if (!userId) {
                throw new UnauthorizedError('User ID is required');
            }

            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 3;

            const result = await this.postService.getNewFeedGroupPosts(
                userId,
                page,
                pageSize
            );
            ResponseUtil.success(
                res,
                result.data,
                'Group feed posts retrieved successfully',
                200,
                result.pagination
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/profile/:user_id
     * Get profile posts for a specific user.
     */
    public getProfilePosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.user_id;
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 3;

            const result = await this.postService.getPostsWithInteraction(
                {
                    author: userId,
                    group: null,
                    status: EPostStatus.ACTIVE,
                },
                userId,
                page,
                pageSize
            );

            ResponseUtil.success(
                res,
                result.data,
                'Profile posts retrieved successfully',
                200,
                result.pagination
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/group/:group_id
     * Get posts for a specific group.
     */
    public getGroupPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const token = await getDecodedTokenFromHeaders(req.headers);
            if (!token) {
                throw new UnauthorizedError('Unauthorized');
            }

            const groupId = req.params.group_id;
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 3;

            const result = await this.postService.getPostsWithInteraction(
                {
                    group: groupId,
                    status: EPostStatus.ACTIVE,
                },
                token.id,
                page,
                pageSize
            );

            ResponseUtil.success(
                res,
                result.data,
                'Group posts retrieved successfully',
                200,
                result.pagination
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/group/:group_id/manage
     * Get manage group posts (active status).
     */
    public getManageGroupPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const token = await getDecodedTokenFromHeaders(req.headers);
            if (!token) {
                throw new UnauthorizedError('Unauthorized');
            }

            const groupId = req.params.group_id;
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 3;

            const result = await this.postService.getPostsWithInteraction(
                {
                    group: groupId,
                    status: EPostStatus.ACTIVE,
                },
                token.id,
                page,
                pageSize
            );

            ResponseUtil.success(
                res,
                result.data,
                'Manage group posts retrieved successfully',
                200,
                result.pagination
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/group/:group_id/manage/pending
     * Get manage group posts (pending status).
     */
    public getManageGroupPostsPending = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const token = await getDecodedTokenFromHeaders(req.headers);
            if (!token) {
                throw new UnauthorizedError('Unauthorized');
            }

            const groupId = req.params.group_id;
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 3;

            const result = await this.postService.getPostsWithInteraction(
                {
                    group: groupId,
                    status: EPostStatus.PENDING,
                },
                token.id,
                page,
                pageSize
            );

            ResponseUtil.success(
                res,
                result.data,
                'Pending group posts retrieved successfully',
                200,
                result.pagination
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/posts/group/:group_id/member/:user_id
     * Get posts by member in a group.
     */
    public getPostByMember = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.user_id;
            const groupId = req.params.group_id;
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 3;

            const result = await this.postService.getPostsWithInteraction(
                {
                    author: userId,
                    group: groupId,
                    status: EPostStatus.ACTIVE,
                },
                userId,
                page,
                pageSize
            );

            ResponseUtil.success(
                res,
                result.data,
                'Member posts retrieved successfully',
                200,
                result.pagination
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
            const userId = req.user?.id;
            if (!userId) {
                throw new UnauthorizedError('Unauthorized');
            }

            const page = parseInt((req.query.page as string) || '1', 10) || 1;
            const pageSize =
                parseInt(
                    (req.query.page_size as string) ||
                        (req.query.pageSize as string) ||
                        '10',
                    10
                ) || 10;

            const result = await this.postService.getSavedPosts(
                userId,
                page,
                pageSize
            );

            ResponseUtil.paginated(res, result.data, result.pagination);
        } catch (error) {
            next(error);
        }
    };
}
