import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { PaginationResult } from '../common/types/base';
import PostInteraction, {
    EPostInteractionType,
} from '../models/post-interaction.model';
import {
    IPostModel,
    IPostWithInteraction,
    EPostStatus,
} from '../models/post.model';
import { PostRepository } from '../repositories/post.repository';
import { BaseService } from './base.service';
import { FollowService } from './follow.service';
import { UserService } from './user.service';

/**
 * Service responsible for post-related business logic.
 */
export class PostService extends BaseService<IPostModel> {
    private postRepository: PostRepository;
    private userService: UserService;
    private followService: FollowService;

    constructor() {
        const repository = new PostRepository();
        super(repository);
        this.postRepository = repository;
        this.userService = new UserService();
        this.followService = new FollowService();
    }

    /**
     * Create a new post
     * @param data - Post data
     * @param userId - User ID performing the action
     * @returns Created post
     */
    async createPost(
        data: Partial<IPostModel>,
        userId: string
    ): Promise<IPostModel> {
        // Validate required fields
        this.validateRequiredFields(data, ['author']);

        return await this.create(data, userId);
    }

    /**
     * Update post by ID
     * @param id - Post ID
     * @param data - Update data
     * @param userId - User ID performing the action
     * @returns Updated post
     */
    async updatePost(
        id: string,
        data: Partial<IPostModel>,
        userId: string
    ): Promise<IPostModel> {
        this.validateId(id);

        // Don't allow changing author
        delete data.author;

        const updated = await this.update(id, data, userId);
        if (!updated) {
            throw new NotFoundError(`Post not found with id: ${id}`);
        }

        return updated;
    }

    /**
     * Get posts by author
     * @param authorId - Author ID
     * @returns Array of posts
     */
    async getPostsByAuthor(authorId: string): Promise<IPostModel[]> {
        this.validateId(authorId, 'Author ID');
        return await this.postRepository.findManyWithSort(
            {
                author: authorId,
                status: EPostStatus.ACTIVE,
            },
            { createdAt: -1 }
        );
    }

    /**
     * Get posts by group
     * @param groupId - Group ID
     * @returns Array of posts
     */
    async getPostsByGroup(groupId: string): Promise<IPostModel[]> {
        this.validateId(groupId, 'Group ID');
        return await this.postRepository.findManyWithSort(
            {
                group: groupId,
                status: EPostStatus.ACTIVE,
            },
            { createdAt: -1 }
        );
    }

    /**
     * Search posts by text
     * @param searchTerm - Search term
     * @returns Array of posts
     */
    async searchPosts(searchTerm: string): Promise<IPostModel[]> {
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new AppError(
                'Search term must be at least 2 characters',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        return await this.postRepository.findMany({
            $text: { $search: searchTerm },
            status: EPostStatus.ACTIVE,
        });
    }

    /**
     * Get posts by tags
     * @param tags - Array of tags
     * @returns Array of posts
     */
    async getPostsByTags(tags: string[]): Promise<IPostModel[]> {
        if (!tags || tags.length === 0) {
            throw new AppError('Tags are required', HTTP_STATUS.BAD_REQUEST);
        }

        return await this.postRepository.findManyWithSort(
            {
                tags: { $in: tags },
                status: EPostStatus.ACTIVE,
            },
            { createdAt: -1 }
        );
    }

    /**
     * Increment post interaction count
     * @param postId - Post ID
     * @param field - Field to increment (lovesCount, sharesCount, commentsCount)
     * @returns Updated post
     */
    async incrementPostCount(
        postId: string,
        field: 'lovesCount' | 'sharesCount' | 'commentsCount'
    ) {
        this.validateId(postId);

        const post = await this.postRepository.findOneAndUpdate(
            { _id: postId },
            { $inc: { [field]: 1 } }
        );

        if (!post) {
            throw new NotFoundError(`Post not found with id: ${postId}`);
        }

        return post;
    }

    /**
     * Decrement post interaction count
     * @param postId - Post ID
     * @param field - Field to decrement (lovesCount, sharesCount, commentsCount)
     * @returns Updated post
     */
    async decrementPostCount(
        postId: string,
        field: 'lovesCount' | 'sharesCount' | 'commentsCount'
    ) {
        this.validateId(postId);

        const post = await this.postRepository.findOneAndUpdate(
            { _id: postId },
            { $inc: { [field]: -1 } }
        );

        if (!post) {
            throw new NotFoundError(`Post not found with id: ${postId}`);
        }

        return post;
    }

    /**
     * Get post by ID with interaction flags.
     * @param postId - Post ID
     * @param userId - User ID to check interactions
     * @returns Post with interaction flags
     */
    async getPostById(
        postId: string,
        userId: string
    ): Promise<IPostWithInteraction> {
        this.validateId(postId, 'Post ID');
        this.validateId(userId, 'User ID');

        const post = await this.postRepository.findByIdWithInteraction(
            postId,
            userId
        );

        if (!post) {
            throw new NotFoundError(`Post not found with id: ${postId}`);
        }

        return post;
    }

    /**
     * Get all posts.
     * @returns Array of posts
     */
    async getAllPosts(): Promise<IPostModel[]> {
        return await this.postRepository.findAll();
    }

    /**
     * Get new feed posts (from followings and friends).
     * @param userId - User ID
     * @param page - Current page
     * @param pageSize - Number of posts per page
     * @returns Paginated posts with interactions
     */
    async getNewFeedPosts(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IPostWithInteraction>> {
        this.validateId(userId, 'User ID');
        this.validatePagination(page, pageSize);

        const user = await this.userService.getByIdOrThrow(userId);
        const followings = await this.followService.getFollowing(userId);

        const followingIds = followings
            .map((f) => {
                if (!f?.following) {
                    return null;
                }
                return typeof f.following === 'string'
                    ? f.following
                    : f.following.toString();
            })
            .filter((id): id is string => Boolean(id));
        const friendIds = (user.friends || [])
            .map((f) => {
                if (!f) return null;
                return typeof f === 'string' ? f : f.toString();
            })
            .filter((id): id is string => Boolean(id));

        // Handle empty arrays
        if (followingIds.length === 0 && friendIds.length === 0) {
            return {
                data: [],
                pagination: {
                    page,
                    pageSize,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                },
            };
        }

        const filters = {
            $or: [
                {
                    author: {
                        $in: followingIds,
                    },
                    option: 'public',
                },
                {
                    author: {
                        $in: friendIds,
                    },
                    option: {
                        $in: ['friends', 'public'],
                    },
                },
            ],
        };

        return await this.postRepository.findManyWithInteraction(
            filters,
            userId,
            page,
            pageSize
        );
    }

    /**
     * Get new feed posts from friends only.
     * @param userId - User ID
     * @param page - Current page
     * @param pageSize - Number of posts per page
     * @returns Paginated posts with interactions
     */
    async getNewFeedFriendPosts(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IPostWithInteraction>> {
        this.validateId(userId, 'User ID');
        this.validatePagination(page, pageSize);

        const user = await this.userService.getByIdOrThrow(userId);
        const friendIds = (user.friends || [])
            .map((f) => (f ? f.toString() : null))
            .filter((id): id is string => Boolean(id));

        if (friendIds.length === 0) {
            return {
                data: [],
                pagination: {
                    page,
                    pageSize,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                },
            };
        }

        return await this.postRepository.findManyWithInteraction(
            {
                author: {
                    $in: friendIds,
                },
            },
            userId,
            page,
            pageSize
        );
    }

    /**
     * Get new feed posts from groups.
     * @param userId - User ID
     * @param page - Current page
     * @param pageSize - Number of posts per page
     * @returns Paginated posts with interactions
     */
    async getNewFeedGroupPosts(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IPostWithInteraction>> {
        this.validateId(userId, 'User ID');
        this.validatePagination(page, pageSize);

        const user = await this.userService.getByIdOrThrow(userId);
        const groupIds = (user.groups || [])
            .map((g) => (g ? g.toString() : null))
            .filter((id): id is string => Boolean(id));

        if (groupIds.length === 0) {
            return {
                data: [],
                pagination: {
                    page,
                    pageSize,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                },
            };
        }

        return await this.postRepository.findManyWithInteraction(
            {
                group: {
                    $in: groupIds,
                },
                status: EPostStatus.ACTIVE,
            },
            userId,
            page,
            pageSize
        );
    }

    /**
     * Get saved posts for the authenticated user.
     * @param userId - User ID
     * @param page - Current page
     * @param pageSize - Number of posts per page
     * @returns Paginated saved posts with interactions
     */
    async getSavedPosts(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IPostWithInteraction>> {
        this.validateId(userId, 'User ID');
        this.validatePagination(page, pageSize);

        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );
        const skip = (currentPage - 1) * currentPageSize;

        const [interactions, total] = await Promise.all([
            PostInteraction.find({
                user: userId,
                type: EPostInteractionType.SAVE,
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(currentPageSize)
                .lean(),
            PostInteraction.countDocuments({
                user: userId,
                type: EPostInteractionType.SAVE,
            }),
        ]);

        const postIds = interactions.map((interaction) =>
            interaction.post.toString()
        );

        const totalPages = Math.ceil(total / currentPageSize) || 1;

        if (postIds.length === 0) {
            return {
                data: [],
                pagination: {
                    page: currentPage,
                    pageSize: currentPageSize,
                    total,
                    totalPages,
                    hasNext: currentPage < totalPages,
                    hasPrev: currentPage > 1,
                },
            };
        }

        const postsResult = await this.postRepository.findManyWithInteraction(
            { _id: { $in: postIds } },
            userId,
            1,
            postIds.length
        );

        const postsMap = new Map(
            postsResult.data.map((post) => [post._id.toString(), post])
        );

        const orderedPosts = postIds
            .map((id) => postsMap.get(id))
            .filter((post): post is IPostWithInteraction => Boolean(post));

        return {
            data: orderedPosts,
            pagination: {
                page: currentPage,
                pageSize: currentPageSize,
                total,
                totalPages,
                hasNext: currentPage < totalPages,
                hasPrev: currentPage > 1,
            },
        };
    }

    /**
     * Get posts with interaction.
     * @param filter - Filter
     * @param userId - User ID
     * @param page - Page
     * @param pageSize - Page size
     * @returns Paginated posts with interactions
     */
    public async getPostsWithInteraction(
        filter: any,
        userId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IPostWithInteraction>> {
        return await this.postRepository.findManyWithInteraction(
            filter,
            userId,
            page,
            pageSize
        );
    }
}
