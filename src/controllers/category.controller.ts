import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../services';
import { ResponseUtil } from '../common/utils/response';

export class CategoryController {
    private categoryService: CategoryService;

    constructor() {
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
            const userId = req.user?.id;

            const category = await this.categoryService.createCategory(
                categoryData,
                userId as string
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
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.page_size as string) || 10;

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
            const { id } = req.params;

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
            const { slug } = req.params;

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
            const { id } = req.params;
            const updateData = req.body;
            const userId = req.user?.id;

            const category = await this.categoryService.updateCategory(
                id,
                updateData,
                userId as string
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
            const { id } = req.params;
            const userId = req.user?.id;

            await this.categoryService.deleteCategory(id, userId as string);

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
            const { q: searchTerm } = req.query;

            if (!searchTerm || typeof searchTerm !== 'string') {
                return ResponseUtil.validationError(
                    res,
                    'Search term is required'
                );
            }

            const categories = await this.categoryService.searchCategories(
                searchTerm
            );

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
