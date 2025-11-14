import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { IItemModel } from '../models/item.model';
import { ItemRepository } from '../repositories/item.repository';
import { BaseService } from './base.service';
import { PaginationResult } from '../common/types/base';

/**
 * Service responsible for marketplace items.
 */
export class ItemService extends BaseService<IItemModel> {
    private itemRepository: ItemRepository;

    constructor() {
        const repository = new ItemRepository();
        super(repository);
        this.itemRepository = repository;
    }

    /**
     * Create a new item
     * @param data - Item data
     * @param userId - User ID performing the action
     * @returns Created item
     */
    async createItem(data: any, userId: string) {
        // Validate required fields
        this.validateRequiredFields(data, [
            'name',
            'seller',
            'description',
            'price',
            'category',
        ]);

        // Set seller from userId
        data.seller = userId;

        // Set default status if not provided
        if (!data.status) {
            data.status = 'active';
        }

        return await this.create(data, userId);
    }

    /**
     * Get item by slug
     * @param slug - Item slug
     * @returns Item or null
     */
    async getItemBySlug(slug: string) {
        const item = await this.itemRepository.findOne({ slug });
        if (!item) {
            throw new NotFoundError(`Item not found with slug: ${slug}`);
        }
        return item;
    }

    /**
     * Get items with pagination for listing pages.
     */
    async getItemsWithPagination(
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IItemModel>> {
        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        return await this.itemRepository.findPaginated(
            {},
            currentPage,
            currentPageSize
        );
    }

    /**
     * Get items by seller
     * @param sellerId - Seller ID
     * @returns Array of items
     */
    async getItemsBySeller(sellerId: string) {
        this.validateId(sellerId, 'Seller ID');
        return await this.itemRepository.findBySeller(sellerId);
    }

    /**
     * Get items by category
     * @param categoryId - Category ID
     * @returns Array of items
     */
    async getItemsByCategory(categoryId: string) {
        this.validateId(categoryId, 'Category ID');
        return await this.itemRepository.findManyWithSort(
            { category: categoryId },
            { createdAt: -1 }
        );
    }

    /**
     * Search items by text
     * @param searchTerm - Search term
     * @returns Array of items
     */
    async searchItems(
        searchTerm: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IItemModel>> {
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new AppError(
                'Search term must be at least 2 characters',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        return await this.itemRepository.searchByText(
            searchTerm,
            currentPage,
            currentPageSize
        );
    }

    /**
     * Update item status
     * @param itemId - Item ID
     * @param status - New status
     * @param userId - User ID
     * @returns Updated item
     */
    async updateItemStatus(itemId: string, status: string, userId: string) {
        this.validateId(itemId);

        const item = await this.update(itemId, { status }, userId);
        if (!item) {
            throw new NotFoundError(`Item not found with id: ${itemId}`);
        }

        return item;
    }

    private normalizePagination(page: number, pageSize: number) {
        return {
            currentPage: Math.max(1, page || 1),
            currentPageSize: Math.max(1, pageSize || 10),
        };
    }
}
