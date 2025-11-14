import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { UserService } from '../services/user.service';

/**
 * Controller for user-related HTTP handlers.
 */
export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    /**
     * GET /api/v1/users
     * Fetch users with pagination metadata.
     */
    public getUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string, 10) || 1;
            const pageSize =
                parseInt(req.query.page_size as string, 10) ||
                parseInt(req.query.pageSize as string, 10) ||
                10;

            const result = await this.userService.getUsersWithPagination({
                page,
                pageSize,
            });

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
     * GET /api/v1/users/:id/friends
     * Retrieve a user's friends list.
     */
    public getFriends = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.params.id as string;
            const friends = await this.userService.getUserFriends(userId);

            ResponseUtil.success(
                res,
                friends,
                'Friends retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
