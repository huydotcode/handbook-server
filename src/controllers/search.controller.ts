import { NextFunction, Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { ResponseUtil } from '../common/utils/response';
import { getDecodedTokenFromHeaders } from '../common/utils/jwt';
import { UnauthorizedError } from '../common/errors/app.error';

/**
 * Controller responsible for handling search-related HTTP requests.
 */
export class SearchController {
    private searchService: SearchService;

    constructor() {
        this.searchService = new SearchService();
    }

    /**
     * GET /api/v1/search
     * Perform a combined search across users, groups, and posts.
     */
    public search = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const query = req.query.q as string;
            const { page, pageSize } = this.getPaginationParams(req);
            const userId = this.getAuthenticatedUserId(req);

            const results = await this.searchService.searchAll(
                query,
                userId,
                page,
                pageSize
            );

            ResponseUtil.success(
                res,
                results,
                'Search results retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/search/users
     * Search only users.
     */
    public searchUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const query = req.query.q as string;
            const { page, pageSize } = this.getPaginationParams(req);
            const userId = this.getAuthenticatedUserId(req);

            const result = await this.searchService.searchUsers(
                query,
                userId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Users retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/search/groups
     * Search only groups.
     */
    public searchGroups = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const query = req.query.q as string;
            const { page, pageSize } = this.getPaginationParams(req);
            const userId = this.getAuthenticatedUserId(req);

            const result = await this.searchService.searchGroups(
                query,
                userId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Groups retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/search/posts
     * Search only posts.
     */
    public searchPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const query = req.query.q as string;
            const { page, pageSize } = this.getPaginationParams(req);
            const userId = this.getAuthenticatedUserId(req);

            const result = await this.searchService.searchPosts(
                query,
                userId,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Posts retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    private getPaginationParams(req: Request): {
        page: number;
        pageSize: number;
    } {
        const page = parseInt((req.query.page as string) || '1', 10);
        const pageSize = parseInt(
            (req.query.page_size as string) ||
                (req.query.pageSize as string) ||
                (req.query.limit as string) ||
                '10',
            10
        );

        return {
            page: Number.isNaN(page) || page < 1 ? 1 : page,
            pageSize: Number.isNaN(pageSize) || pageSize < 1 ? 10 : pageSize,
        };
    }

    private getAuthenticatedUserId(req: Request): string {
        if (req.user?.id) {
            return req.user.id;
        }

        const decoded = getDecodedTokenFromHeaders(req.headers);
        if (decoded?.id) {
            return decoded.id;
        }

        throw new UnauthorizedError('Unauthorized');
    }
}
