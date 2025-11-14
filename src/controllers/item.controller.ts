import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import {
    getPaginationParams,
    validateRequiredParam,
} from '../common/utils/controller.helper';
import { ItemService } from '../services/item.service';
import { AppError } from '../common/errors/app.error';
import { HTTP_STATUS } from '../common/constants/status-code';

/**
 * Controller responsible for marketplace item endpoints.
 */
export class ItemController {
    private itemService: ItemService;

    constructor() {
        this.itemService = new ItemService();
    }

    /**
     * GET /api/v1/items
     * Fetch paginated items.
     */
    public getAllItems = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { page, pageSize } = getPaginationParams(req, 10);

            const result = await this.itemService.getItemsWithPagination(
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Items retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/items/search
     * Search items by keyword with pagination.
     */
    public searchItems = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const query = (req.query.q as string) || '';
            if (!query) {
                throw new AppError(
                    'Query parameter is required',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            const { page, pageSize } = getPaginationParams(req, 10);

            const result = await this.itemService.searchItems(
                query,
                page,
                pageSize
            );

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Items searched successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/items/seller/:sellerId
     * Fetch items posted by a seller.
     */
    public getItemsBySeller = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const sellerId = req.params.sellerId;
            validateRequiredParam(sellerId, 'Seller ID');

            const items = await this.itemService.getItemsBySeller(sellerId);

            ResponseUtil.success(
                res,
                items,
                'Seller items retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
