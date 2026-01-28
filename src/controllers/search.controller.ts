import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { SearchService } from '../services/search.service';
import { BaseController } from './base.controller';

export class SearchController extends BaseController {
    private searchService: SearchService;

    constructor() {
        super();
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
}
