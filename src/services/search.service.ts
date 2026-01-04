import { PaginationResult } from '../common/types/base';
import { UnauthorizedError, ValidationError } from '../common/errors/app.error';
import { SearchRepository } from '../repositories/search.repository';
import { IUserModel } from '../models/user.model';
import { IGroupModel } from '../models/group.model';
import { IPostWithInteraction, EPostStatus } from '../models/post.model';
import { PostService } from './post.service';

interface SearchAggregatedResult {
    users: PaginationResult<IUserModel>;
    groups: PaginationResult<IGroupModel>;
    posts: PaginationResult<IPostWithInteraction>;
}

/**
 * Service layer for handling search business logic.
 */
export class SearchService {
    private searchRepository: SearchRepository;
    private postService: PostService;

    constructor() {
        this.searchRepository = new SearchRepository();
        this.postService = new PostService();
    }

    /**
     * Search across users, groups, and posts with a single query.
     */
    async searchAll(
        query: string,
        userId: string,
        page: number,
        pageSize: number
    ): Promise<SearchAggregatedResult> {
        const sanitizedQuery = this.validateQuery(query);
        this.ensureAuthenticated(userId);
        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        const [users, groups, posts] = await Promise.all([
            this.searchRepository.searchUsers(
                sanitizedQuery,
                userId,
                currentPage,
                currentPageSize
            ),
            this.searchRepository.searchGroups(
                sanitizedQuery,
                userId,
                currentPage,
                currentPageSize
            ),
            this.searchPosts(
                sanitizedQuery,
                userId,
                currentPage,
                currentPageSize
            ),
        ]);

        return { users, groups, posts };
    }

    /**
     * Search users only.
     */
    async searchUsers(
        query: string,
        userId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IUserModel>> {
        const sanitizedQuery = this.validateQuery(query);
        this.ensureAuthenticated(userId);
        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        return this.searchRepository.searchUsers(
            sanitizedQuery,
            userId,
            currentPage,
            currentPageSize
        );
    }

    /**
     * Search groups only.
     */
    async searchGroups(
        query: string,
        userId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IGroupModel>> {
        const sanitizedQuery = this.validateQuery(query);
        this.ensureAuthenticated(userId);
        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        return this.searchRepository.searchGroups(
            sanitizedQuery,
            userId,
            currentPage,
            currentPageSize
        );
    }

    /**
     * Search posts only.
     */
    async searchPosts(
        query: string,
        userId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IPostWithInteraction>> {
        const sanitizedQuery = this.validateQuery(query);
        this.ensureAuthenticated(userId);
        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        return this.postService.getPostsWithInteraction(
            {
                $text: { $search: sanitizedQuery },
                status: EPostStatus.ACTIVE,
            },
            userId,
            currentPage,
            currentPageSize
        );
    }

    private ensureAuthenticated(userId?: string): void {
        if (!userId) {
            throw new UnauthorizedError('Unauthorized');
        }
    }

    private validateQuery(query?: string): string {
        if (!query || !query.trim()) {
            throw new ValidationError('Search query is required');
        }

        const sanitized = query.trim();
        if (sanitized.length < 2) {
            throw new ValidationError(
                'Search query must be at least 2 characters'
            );
        }

        return sanitized;
    }

    private normalizePagination(
        page?: number,
        pageSize?: number
    ): {
        currentPage: number;
        currentPageSize: number;
    } {
        const parsedPage = Number(page);
        const parsedSize = Number(pageSize);

        const currentPage =
            Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

        const normalizedSize =
            Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : 10;
        const currentPageSize = Math.min(normalizedSize, 50);

        return { currentPage, currentPageSize };
    }
}
