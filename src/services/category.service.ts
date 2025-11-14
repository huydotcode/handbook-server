import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { ICategoryModel, ICategoryInput } from '../models/category.model';
import { CategoryRepository } from '../repositories/category.repository';
import { BaseService } from './base.service';
import { PaginationParams, PaginationResult } from '../common/types/base';

export class CategoryService extends BaseService<ICategoryModel> {
    private categoryRepository: CategoryRepository;

    constructor() {
        const repository = new CategoryRepository();
        super(repository);
        this.categoryRepository = repository;
    }

    /**
     * Create a new category
     * @param data - Category data
     * @param userId - User ID performing the action
     * @returns Created category
     */
    async createCategory(
        data: ICategoryInput,
        userId: string
    ): Promise<ICategoryModel> {
        try {
            // Validate required fields
            this.validateRequiredFields(data, ['name', 'description', 'slug']);

            // Validate slug format
            this.validateSlug(data.slug);

            // Normalize slug
            const normalizedSlug = data.slug.toLowerCase();

            // Check if slug already exists
            const slugExists = await this.categoryRepository.slugExists(
                normalizedSlug
            );
            if (slugExists) {
                throw new AppError(
                    'Category slug already exists',
                    HTTP_STATUS.CONFLICT
                );
            }

            // Create category
            const category = await this.create(
                { ...data, slug: normalizedSlug },
                userId
            );

            return category;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to create category: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get all categories with pagination
     * @param params - Pagination parameters
     * @returns Paginated categories
     */
    async getCategories(
        params: PaginationParams
    ): Promise<PaginationResult<ICategoryModel>> {
        try {
            return await this.getAll(params);
        } catch (error) {
            throw new AppError(
                `Failed to get categories: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get category by ID
     * @param id - Category ID
     * @returns Category
     */
    async getCategoryById(id: string): Promise<ICategoryModel> {
        try {
            this.validateId(id);
            return await this.getByIdOrThrow(id);
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to get category: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get category by slug
     * @param slug - Category slug
     * @returns Category
     */
    async getCategoryBySlug(slug: string): Promise<ICategoryModel> {
        try {
            if (!slug || slug.trim().length === 0) {
                throw new AppError('Slug is required', HTTP_STATUS.BAD_REQUEST);
            }

            const category = await this.categoryRepository.findBySlug(slug);
            if (!category) {
                throw new NotFoundError(
                    `Category not found with slug: ${slug}`
                );
            }

            return category as ICategoryModel;
        } catch (error) {
            if (error instanceof AppError || error instanceof NotFoundError) {
                throw error;
            }
            throw new AppError(
                `Failed to get category by slug: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update a category
     * @param id - Category ID
     * @param data - Update data
     * @param userId - User ID performing the action
     * @returns Updated category
     */
    async updateCategory(
        id: string,
        data: Partial<ICategoryInput>,
        userId: string
    ): Promise<ICategoryModel> {
        try {
            this.validateId(id);

            // If updating slug, validate it doesn't exist
            if (data.slug) {
                this.validateSlug(data.slug);
                const normalizedSlug = data.slug.toLowerCase();
                const slugExists = await this.categoryRepository.slugExists(
                    normalizedSlug,
                    id
                );
                if (slugExists) {
                    throw new AppError(
                        'Category slug already exists',
                        HTTP_STATUS.CONFLICT
                    );
                }
                data.slug = normalizedSlug;
            }

            const updated = await this.update(id, data, userId);
            if (!updated) {
                throw new NotFoundError(`Category not found with id: ${id}`);
            }

            return updated;
        } catch (error) {
            if (error instanceof AppError || error instanceof NotFoundError) {
                throw error;
            }
            throw new AppError(
                `Failed to update category: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Delete a category
     * @param id - Category ID
     * @param userId - User ID performing the action
     * @returns True if deleted
     */
    async deleteCategory(id: string, userId: string): Promise<boolean> {
        try {
            this.validateId(id);

            const deleted = await this.delete(id, userId);
            if (!deleted) {
                throw new NotFoundError(`Category not found with id: ${id}`);
            }

            return true;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to delete category: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Search categories by name or description
     * @param searchTerm - Search term
     * @returns Array of categories
     */
    async searchCategories(searchTerm: string): Promise<ICategoryModel[]> {
        try {
            if (!searchTerm || searchTerm.trim().length < 2) {
                throw new AppError(
                    'Search term must be at least 2 characters',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            const categories = await this.categoryRepository.searchByName(
                searchTerm.trim()
            );
            return categories as ICategoryModel[];
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to search categories: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get all categories (simplified for dropdowns, selects, etc.)
     * @returns Array of categories
     */
    async getAllCategories(): Promise<ICategoryModel[]> {
        try {
            const categories =
                await this.categoryRepository.findActiveCategories();
            return categories as ICategoryModel[];
        } catch (error) {
            throw new AppError(
                `Failed to get all categories: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Validate slug format
     * @param slug - Slug to validate
     * @throws AppError if slug format is invalid
     */
    private validateSlug(slug: string): void {
        if (!slug || slug.trim().length === 0) {
            throw new AppError('Slug is required', HTTP_STATUS.BAD_REQUEST);
        }

        // Slug can only contain lowercase letters, numbers, and hyphens
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            throw new AppError(
                'Slug can only contain lowercase letters, numbers, and hyphens',
                HTTP_STATUS.BAD_REQUEST,
                { slug }
            );
        }

        // Slug must be between 3 and 50 characters
        if (slug.length < 3 || slug.length > 50) {
            throw new AppError(
                'Slug must be between 3 and 50 characters',
                HTTP_STATUS.BAD_REQUEST,
                { slug, length: slug.length }
            );
        }
    }
}
