import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { CategoryService } from '../services';
import { BaseController } from './base.controller';

export class CategoryController extends BaseController {
    private categoryService: CategoryService;

    constructor() {
        super();
        this.categoryService = new CategoryService();
    }

    /**
     * POST /api/v1/categories
     * Create a new category
     */
    public createCategory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const categoryData = req.body;
            const userId = this.getAuthenticatedUserId(req);

            const category = await this.categoryService.createCategory(
                categoryData,
                userId
            );

            ResponseUtil.created(
                res,
                category,
                'Category created successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/categories
     * Get all categories with pagination
     */
    public getCategories = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { page, pageSize } = this.getPaginationParams(req, 10);

            const result = await this.categoryService.getCategories({
                page,
                pageSize,
            });

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Categories retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/categories/all
     * Get all categories (simplified list)
     */
    public getAllCategories = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const categories = await this.categoryService.getAllCategories();

            ResponseUtil.success(
                res,
                categories,
                'All categories retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/categories/:id
     * Get category by ID
     */
    public getCategoryById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.params.id;
            this.validateRequiredParam(id, 'Category ID');

            const category = await this.categoryService.getCategoryById(id);

            ResponseUtil.success(
                res,
                category,
                'Category retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/categories/slug/:slug
     * Get category by slug
     */
    public getCategoryBySlug = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const slug = req.params.slug;
            this.validateRequiredParam(slug, 'Slug');

            const category = await this.categoryService.getCategoryBySlug(slug);

            ResponseUtil.success(
                res,
                category,
                'Category retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/categories/:id
     * Update a category
     */
    public updateCategory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.params.id;
            this.validateRequiredParam(id, 'Category ID');
            const updateData = req.body;
            const userId = this.getAuthenticatedUserId(req);

            const category = await this.categoryService.updateCategory(
                id,
                updateData,
                userId
            );

            ResponseUtil.updated(
                res,
                category,
                'Category updated successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/categories/:id
     * Delete a category
     */
    public deleteCategory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.params.id;
            this.validateRequiredParam(id, 'Category ID');
            const userId = this.getAuthenticatedUserId(req);

            await this.categoryService.deleteCategory(id, userId);

            ResponseUtil.deleted(res, 'Category deleted successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/categories/search?q=searchTerm
     * Search categories
     */
    public searchCategories = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const searchTerm = req.query.q as string;
            this.validateRequiredParam(searchTerm, 'Search term');

            const categories =
                await this.categoryService.searchCategories(searchTerm);

            ResponseUtil.success(
                res,
                categories,
                'Categories found successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
