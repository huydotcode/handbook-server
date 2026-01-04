import { Types } from 'mongoose';
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
            'description',
            'price',
            'category',
            'location',
        ]);

        // Set seller from userId
        data.seller = new Types.ObjectId(userId);

        // Generate slug from name
        let baseSlug = this.generateSlug(data.name);
        let slug = baseSlug;
        let counter = 1;

        // Check if slug already exists, if so, append counter
        while (await this.itemRepository.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        data.slug = slug;

        // Convert imagesIds to images if provided
        if (data.imagesIds && Array.isArray(data.imagesIds)) {
            data.images = data.imagesIds.map(
                (id: string) => new Types.ObjectId(id)
            );
            delete data.imagesIds;
        } else if (!data.images) {
            data.images = [];
        }

        // Convert category and location to ObjectId
        if (typeof data.category === 'string') {
            data.category = new Types.ObjectId(data.category);
        }
        if (typeof data.location === 'string') {
            data.location = new Types.ObjectId(data.location);
        }

        // Set default status if not provided
        if (!data.status) {
            data.status = 'active';
        }

        // Validate price
        if (data.price < 0) {
            throw new AppError(
                'Price must be non-negative',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        return await this.create(data, userId);
    }

    /**
     * Get item by ID
     * @param itemId - Item ID
     * @returns Item
     */
    async getItemById(itemId: string) {
        this.validateId(itemId, 'Item ID');
        const item = await this.itemRepository.findById(itemId);
        if (!item) {
            throw new NotFoundError(`Item not found with id: ${itemId}`);
        }
        return item;
    }

    /**
     * Get item by ID with populated relations
     * @param itemId - Item ID
     * @returns Item with populated relations
     */
    async getItemByIdWithDetails(itemId: string) {
        this.validateId(itemId, 'Item ID');
        const item = await this.itemRepository.findByIdWithDetails(itemId);
        if (!item) {
            throw new NotFoundError(`Item not found with id: ${itemId}`);
        }
        return item;
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
     * Get items by category with pagination
     * @param categoryId - Category ID
     * @param page - Page number
     * @param pageSize - Page size
     * @returns Paginated items
     */
    async getItemsByCategory(
        categoryId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IItemModel>> {
        this.validateId(categoryId, 'Category ID');
        this.validatePagination(page, pageSize);

        const { currentPage, currentPageSize } = this.normalizePagination(
            page,
            pageSize
        );

        return await this.itemRepository.findPaginated(
            { category: new Types.ObjectId(categoryId) },
            currentPage,
            currentPageSize
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
     * Update item
     * @param itemId - Item ID
     * @param data - Update data
     * @param userId - User ID performing the action
     * @returns Updated item
     */
    async updateItem(itemId: string, data: any, userId: string) {
        this.validateId(itemId, 'Item ID');
        this.validateId(userId, 'User ID');

        // Get item and verify user is seller
        const item = await this.getByIdOrThrow(itemId);

        const sellerId =
            typeof item.seller === 'string'
                ? item.seller
                : item.seller.toString();
        if (sellerId !== userId) {
            throw new AppError(
                'Only the seller can update this item',
                HTTP_STATUS.FORBIDDEN
            );
        }

        // Don't allow changing seller
        delete data.seller;

        // Generate new slug if name is being updated
        if (data.name && data.name !== item.name) {
            let baseSlug = this.generateSlug(data.name);
            let slug = baseSlug;
            let counter = 1;

            // Check if slug already exists (excluding current item)
            while (
                await this.itemRepository.findOne({
                    slug,
                    _id: { $ne: new Types.ObjectId(itemId) },
                })
            ) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            data.slug = slug;
        }

        // Convert imagesIds to images if provided
        if (data.imagesIds && Array.isArray(data.imagesIds)) {
            data.images = data.imagesIds.map(
                (id: string) => new Types.ObjectId(id)
            );
            delete data.imagesIds;
        }

        // Convert category and location to ObjectId if provided
        if (data.category && typeof data.category === 'string') {
            data.category = new Types.ObjectId(data.category);
        }
        if (data.location && typeof data.location === 'string') {
            data.location = new Types.ObjectId(data.location);
        }

        // Validate price if provided
        if (data.price !== undefined && data.price < 0) {
            throw new AppError(
                'Price must be non-negative',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        const updated = await this.update(itemId, data, userId);
        if (!updated) {
            throw new NotFoundError(`Item not found with id: ${itemId}`);
        }

        return updated;
    }

    /**
     * Delete item
     * @param itemId - Item ID
     * @param userId - User ID performing the action
     * @returns True if deleted
     */
    async deleteItem(itemId: string, userId: string): Promise<boolean> {
        this.validateId(itemId, 'Item ID');
        this.validateId(userId, 'User ID');

        // Get item and verify user is seller
        const item = await this.getByIdOrThrow(itemId);

        const sellerId =
            typeof item.seller === 'string'
                ? item.seller
                : item.seller.toString();
        if (sellerId !== userId) {
            throw new AppError(
                'Only the seller can delete this item',
                HTTP_STATUS.FORBIDDEN
            );
        }

        // Delete item
        const deleted = await this.delete(itemId, userId);
        if (!deleted) {
            throw new NotFoundError(`Item not found with id: ${itemId}`);
        }

        return true;
    }

    /**
     * Update item status
     * @param itemId - Item ID
     * @param status - New status
     * @param userId - User ID
     * @returns Updated item
     */
    async updateItemStatus(itemId: string, status: string, userId: string) {
        this.validateId(itemId, 'Item ID');

        // Get item and verify user is seller
        const item = await this.getByIdOrThrow(itemId);

        const sellerId =
            typeof item.seller === 'string'
                ? item.seller
                : item.seller.toString();
        if (sellerId !== userId) {
            throw new AppError(
                'Only the seller can update this item status',
                HTTP_STATUS.FORBIDDEN
            );
        }

        const updated = await this.update(itemId, { status }, userId);
        if (!updated) {
            throw new NotFoundError(`Item not found with id: ${itemId}`);
        }

        return updated;
    }
}
