import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { PaginationParams, PaginationResult } from '../common/types/base';

export abstract class BaseRepository<T extends Document> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    /**
     * Find a document by ID
     * @param id - Document ID
     * @returns Document or null if not found
     */
    async findById(id: string): Promise<T | null> {
        try {
            const document = await this.model.findById(id).lean();
            return document as T | null;
        } catch (error) {
            console.error('Database error in findById:', error);
            throw error;
        }
    }

    /**
     * Find one document by filter
     * @param filter - MongoDB filter query
     * @returns Document or null if not found
     */
    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        try {
            const document = await this.model.findOne(filter).lean();
            return document as T | null;
        } catch (error) {
            console.error('Database error in findOne:', error);
            throw error;
        }
    }

    /**
     * Find multiple documents by filter
     * @param filter - MongoDB filter query
     * @returns Array of documents (empty array if none found)
     */
    async findMany(filter: FilterQuery<T> = {}): Promise<T[]> {
        try {
            const documents = await this.model.find(filter).lean();
            return documents as T[];
        } catch (error) {
            console.error('Database error in findMany:', error);
            throw error;
        }
    }

    /**
     * Find documents with pagination
     * @param filter - MongoDB filter query
     * @param params - Pagination parameters
     * @returns Paginated result with data and metadata
     */
    async findWithPagination(
        filter: FilterQuery<T> = {},
        params: PaginationParams
    ): Promise<PaginationResult<T>> {
        try {
            const {
                page,
                pageSize,
                sortBy = 'createdAt',
                sortOrder = 'desc',
            } = params;
            const skip = (page - 1) * pageSize;

            const sort: any = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const [data, total] = await Promise.all([
                this.model
                    .find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(pageSize)
                    .lean(),
                this.model.countDocuments(filter),
            ]);

            const totalPages = Math.ceil(total / pageSize);

            return {
                data: data as T[],
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            };
        } catch (error) {
            console.error('Database error in findWithPagination:', error);
            throw error;
        }
    }

    /**
     * Create a new document
     * @param data - Document data
     * @returns Created document
     */
    async create(data: Partial<T>): Promise<T> {
        try {
            const document = new this.model(data);
            await document.save();
            return document.toObject() as T;
        } catch (error) {
            console.error('Database error in create:', error);
            throw error;
        }
    }

    /**
     * Update a document by ID
     * @param id - Document ID
     * @param data - Update data
     * @returns Updated document or null if not found
     */
    async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
        try {
            const document = await this.model
                .findByIdAndUpdate(id, data, { new: true, runValidators: true })
                .lean();
            return document as T | null;
        } catch (error) {
            console.error('Database error in update:', error);
            throw error;
        }
    }

    /**
     * Delete a document by ID
     * @param id - Document ID
     * @returns True if deleted, false if not found
     */
    async delete(id: string): Promise<boolean> {
        try {
            const result = await this.model.findByIdAndDelete(id);
            return !!result;
        } catch (error) {
            console.error('Database error in delete:', error);
            throw error;
        }
    }

    /**
     * Count documents by filter
     * @param filter - MongoDB filter query
     * @returns Number of documents
     */
    async count(filter: FilterQuery<T> = {}): Promise<number> {
        try {
            return await this.model.countDocuments(filter);
        } catch (error) {
            console.error('Database error in count:', error);
            throw error;
        }
    }

    /**
     * Check if documents exist by filter
     * @param filter - MongoDB filter query
     * @returns True if exists, false otherwise
     */
    async exists(filter: FilterQuery<T>): Promise<boolean> {
        try {
            const count = await this.model.countDocuments(filter);
            return count > 0;
        } catch (error) {
            console.error('Database error in exists:', error);
            throw error;
        }
    }

    /**
     * Find documents by filter with limit
     * @param filter - MongoDB filter query
     * @param limit - Maximum number of documents to return
     * @returns Array of documents
     */
    async findManyWithLimit(
        filter: FilterQuery<T> = {},
        limit: number
    ): Promise<T[]> {
        try {
            const documents = await this.model.find(filter).limit(limit).lean();
            return documents as T[];
        } catch (error) {
            console.error('Database error in findManyWithLimit:', error);
            throw error;
        }
    }

    /**
     * Find documents by filter with sorting
     * @param filter - MongoDB filter query
     * @param sort - Sort options
     * @returns Array of documents
     */
    async findManyWithSort(
        filter: FilterQuery<T> = {},
        sort: Record<string, 1 | -1>
    ): Promise<T[]> {
        try {
            const documents = await this.model.find(filter).sort(sort).lean();
            return documents as T[];
        } catch (error) {
            console.error('Database error in findManyWithSort:', error);
            throw error;
        }
    }

    /**
     * Find and update a document
     * @param filter - MongoDB filter query
     * @param data - Update data
     * @param options - Update options
     * @returns Updated document or null if not found
     */
    async findOneAndUpdate(
        filter: FilterQuery<T>,
        data: UpdateQuery<T>,
        options: any = { new: true, runValidators: true }
    ): Promise<T | null> {
        try {
            const document = await this.model
                .findOneAndUpdate(filter, data, options)
                .lean();
            return document as T | null;
        } catch (error) {
            console.error('Database error in findOneAndUpdate:', error);
            throw error;
        }
    }

    /**
     * Find and delete a document
     * @param filter - MongoDB filter query
     * @returns Deleted document or null if not found
     */
    async findOneAndDelete(filter: FilterQuery<T>): Promise<T | null> {
        try {
            const document = await this.model.findOneAndDelete(filter).lean();
            return document as T | null;
        } catch (error) {
            console.error('Database error in findOneAndDelete:', error);
            throw error;
        }
    }

    /**
     * Bulk create documents
     * @param data - Array of document data
     * @returns Array of created documents
     */
    async createMany(data: Partial<T>[]): Promise<T[]> {
        try {
            const documents = await this.model.insertMany(data);
            return documents as unknown as T[];
        } catch (error) {
            console.error('Database error in createMany:', error);
            throw error;
        }
    }

    /**
     * Bulk update documents
     * @param filter - MongoDB filter query
     * @param data - Update data
     * @returns Update result
     */
    async updateMany(
        filter: FilterQuery<T>,
        data: UpdateQuery<T>
    ): Promise<any> {
        try {
            return await this.model.updateMany(filter, data);
        } catch (error) {
            console.error('Database error in updateMany:', error);
            throw error;
        }
    }

    /**
     * Bulk delete documents
     * @param filter - MongoDB filter query
     * @returns Delete result
     */
    async deleteMany(filter: FilterQuery<T>): Promise<any> {
        try {
            return await this.model.deleteMany(filter);
        } catch (error) {
            console.error('Database error in deleteMany:', error);
            throw error;
        }
    }
}
