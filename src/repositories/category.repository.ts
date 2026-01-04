import Category, { ICategoryModel } from '../models/category.model';
import { BaseRepository } from './base.repository';

export class CategoryRepository extends BaseRepository<ICategoryModel> {
    constructor() {
        super(Category);
    }

    /**
     * Find category by slug
     * @param slug - Category slug
     * @returns Category or null
     */
    async findBySlug(slug: string) {
        return await this.model.findOne({ slug: slug.toLowerCase() }).lean();
    }

    /**
     * Check if slug exists (for validation)
     * @param slug - Category slug
     * @param excludeId - Category ID to exclude from check
     * @returns True if exists, false otherwise
     */
    async slugExists(slug: string, excludeId?: string) {
        const query: any = { slug: slug.toLowerCase() };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        return await this.model.exists(query);
    }

    /**
     * Find categories by name (search)
     * @param searchTerm - Search term
     * @returns Array of categories
     */
    async searchByName(searchTerm: string) {
        return await this.model
            .find({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                ],
            })
            .sort({ name: 1 })
            .lean();
    }

    /**
     * Get all active categories (for dropdown, select, etc.)
     * @returns Array of categories
     */
    async findActiveCategories() {
        return await this.model
            .find({})
            .sort({ name: 1 })
            .select('name slug icon description')
            .lean();
    }

    /**
     * Count categories
     * @returns Total count
     */
    async countCategories() {
        return await this.model.countDocuments({});
    }

    /**
     * Get categories with pagination and sorting
     * @param params - Pagination and sorting params
     * @returns Paginated categories
     */
    async findWithSorting(
        page: number = 1,
        pageSize: number = 10,
        sortBy: string = 'createdAt',
        sortOrder: 'asc' | 'desc' = 'desc'
    ) {
        const skip = (page - 1) * pageSize;
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            this.model.find({}).sort(sort).skip(skip).limit(pageSize).lean(),
            this.model.countDocuments({}),
        ]);

        return {
            data,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
                hasNext: page < Math.ceil(total / pageSize),
                hasPrev: page > 1,
            },
        };
    }
}
