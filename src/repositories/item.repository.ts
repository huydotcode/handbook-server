import { Types } from 'mongoose';
import { PaginationResult } from '../common/types/base';
import { POPULATE_USER } from '../common/utils/populate';
import Item, { IItemModel } from '../models/item.model';
import { BaseRepository } from './base.repository';

/**
 * Repository responsible for item data access.
 */
export class ItemRepository extends BaseRepository<IItemModel> {
    constructor() {
        super(Item);
    }

    /**
     * Find items with pagination + population.
     */
    async findPaginated(
        filter: Record<string, any>,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IItemModel>> {
        const skip = (page - 1) * pageSize;

        const [items, total] = await Promise.all([
            this.model
                .find(filter)
                .populate('category')
                .populate('location')
                .populate('seller', POPULATE_USER)
                .populate('images')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            this.model.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
            data: items,
            pagination: {
                page,
                pageSize,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }

    /**
     * Search items by keyword with pagination.
     */
    async searchByText(
        keyword: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IItemModel>> {
        return await this.findPaginated(
            { $text: { $search: keyword } },
            page,
            pageSize
        );
    }

    /**
     * Find all items of a seller with populated fields.
     */
    async findBySeller(sellerId: string): Promise<IItemModel[]> {
        return await this.model
            .find({ seller: new Types.ObjectId(sellerId) })
            .populate('category')
            .populate('location')
            .populate('seller', POPULATE_USER)
            .populate('images')
            .sort({ createdAt: -1 })
            .lean();
    }

    /**
     * Find item by ID with populated relations.
     */
    async findByIdWithDetails(id: string): Promise<IItemModel | null> {
        return await this.model
            .findById(id)
            .populate('category')
            .populate('location')
            .populate('seller', POPULATE_USER)
            .populate('images')
            .lean();
    }
}
