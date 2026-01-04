import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import {
    getAuthenticatedUserId,
    getPaginationParams,
    validateRequiredParam,
    validateRequiredBodyField,
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
     * Fetch paginated items (supports category_id query parameter).
     */
    public getAllItems = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const categoryId = req.query.category_id as string;
            const { page, pageSize } = getPaginationParams(req, 10);

            let result;
            if (categoryId) {
                // If category_id is provided, filter by category
                result = await this.itemService.getItemsByCategory(
                    categoryId,
                    page,
                    pageSize
                );
            } else {
                // Otherwise, get all items
                result = await this.itemService.getItemsWithPagination(
                    page,
                    pageSize
                );
            }

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

    /**
     * POST /api/v1/items
     * Create a new item.
     */
    public createItem = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const itemData = req.body;
            validateRequiredBodyField(req.body, 'name');
            validateRequiredBodyField(req.body, 'description');
            validateRequiredBodyField(req.body, 'price');
            validateRequiredBodyField(req.body, 'category');
            validateRequiredBodyField(req.body, 'location');

            const item = await this.itemService.createItem(itemData, userId);

            ResponseUtil.created(res, item, 'Item created successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/items/:id
     * Get item by ID.
     */
    public getItemById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const itemId = req.params.id;
            validateRequiredParam(itemId, 'Item ID');

            const item = await this.itemService.getItemByIdWithDetails(itemId);

            ResponseUtil.success(res, item, 'Item retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/items/:id
     * Update item (seller only).
     */
    public updateItem = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const itemId = req.params.id;
            validateRequiredParam(itemId, 'Item ID');
            const userId = getAuthenticatedUserId(req);
            const itemData = req.body;

            const item = await this.itemService.updateItem(
                itemId,
                itemData,
                userId
            );

            ResponseUtil.success(res, item, 'Item updated successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/items/:id
     * Delete item (seller only).
     */
    public deleteItem = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const itemId = req.params.id;
            validateRequiredParam(itemId, 'Item ID');
            const userId = getAuthenticatedUserId(req);

            await this.itemService.deleteItem(itemId, userId);

            ResponseUtil.success(
                res,
                { success: true },
                'Item deleted successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
