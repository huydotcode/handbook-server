import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError } from '../common/errors/app.error';
import { ResponseUtil } from '../common/utils/response';
import { ItemService } from '../services/item.service';
import { BaseController } from './base.controller';

/**
 * Controller responsible for marketplace item endpoints.
 */
export class ItemController extends BaseController {
    private itemService: ItemService;

    constructor() {
        super();
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
            const { page, pageSize } = this.getPaginationParams(req, 10);

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

            const { page, pageSize } = this.getPaginationParams(req, 10);

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
            this.validateRequiredParam(sellerId, 'Seller ID');

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
            const userId = this.getAuthenticatedUserId(req);
            const itemData = req.body;
            this.validateRequiredBodyField(req.body, 'name');
            this.validateRequiredBodyField(req.body, 'description');
            this.validateRequiredBodyField(req.body, 'price');
            this.validateRequiredBodyField(req.body, 'category');
            this.validateRequiredBodyField(req.body, 'location');

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
            this.validateRequiredParam(itemId, 'Item ID');

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
            this.validateRequiredParam(itemId, 'Item ID');
            const userId = this.getAuthenticatedUserId(req);
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
            this.validateRequiredParam(itemId, 'Item ID');
            const userId = this.getAuthenticatedUserId(req);

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
