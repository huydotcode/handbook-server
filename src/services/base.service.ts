import { Document } from 'mongoose';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, NotFoundError } from '../common/errors/app.error';
import { BaseRepository } from '../repositories/base.repository';
import { PaginationParams, PaginationResult } from '../common/types/base';

/**
 * Base Service Class
 */
export abstract class BaseService<T extends Document> {
    protected repository: BaseRepository<T>;

    constructor(repository: BaseRepository<T>) {
        this.repository = repository;
    }

    /**
     * Get all entities with pagination
     * @param params - Pagination parameters
     * @returns Paginated result
     */
    async getAll(params: PaginationParams): Promise<PaginationResult<T>> {
        this.validatePagination(params.page, params.pageSize);
        return await this.repository.findWithPagination({}, params);
    }

    /**
     * Get entity by ID
     * @param id - Entity ID
     * @returns Entity or null
     */
    async getById(id: string): Promise<T | null> {
        this.validateId(id);
        return await this.repository.findById(id);
    }

    /**
     * Get entity by ID (throws error if not found)
     * @param id - Entity ID
     * @returns Entity
     * @throws NotFoundError if entity not found
     */
    async getByIdOrThrow(id: string): Promise<T> {
        this.validateId(id);
        const entity = await this.repository.findById(id);
        if (!entity) {
            throw new NotFoundError(`Resource not found with id: ${id}`);
        }
        return entity;
    }

    /**
     * Create new entity
     * @param data - Entity data
     * @param userId - User ID performing the action
     * @returns Created entity
     */
    async create(data: Partial<T>, userId: string): Promise<T> {
        try {
            const entity = await this.repository.create(data);
            this.logActivity(userId, 'created', entity._id as string);
            return entity;
        } catch (error) {
            this.handleDuplicateKeyError(error, 'field');
            throw error;
        }
    }

    /**
     * Update entity by ID
     * @param id - Entity ID
     * @param data - Update data
     * @param userId - User ID performing the action
     * @returns Updated entity or null
     */
    async update(
        id: string,
        data: Partial<T>,
        userId: string
    ): Promise<T | null> {
        this.validateId(id);

        const entity = await this.repository.update(id, data);
        if (!entity) {
            throw new NotFoundError(`Resource not found with id: ${id}`);
        }

        this.logActivity(userId, 'updated', id);
        return entity;
    }

    /**
     * Delete entity by ID
     * @param id - Entity ID
     * @param userId - User ID performing the action
     * @returns True if deleted, false if not found
     */
    async delete(id: string, userId: string): Promise<boolean> {
        this.validateId(id);

        const deleted = await this.repository.delete(id);
        if (deleted) {
            this.logActivity(userId, 'deleted', id);
        }
        return deleted;
    }

    /**
     * Delete entity by ID (throws error if not found)
     * @param id - Entity ID
     * @param userId - User ID performing the action
     * @returns True if deleted
     * @throws NotFoundError if entity not found
     */
    async deleteOrThrow(id: string, userId: string): Promise<boolean> {
        this.validateId(id);

        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new NotFoundError(`Resource not found with id: ${id}`);
        }

        this.logActivity(userId, 'deleted', id);
        return true;
    }

    /**
     * Count entities by filter
     * @param filter - Filter query
     * @returns Number of entities
     */
    async count(filter: any = {}): Promise<number> {
        return await this.repository.count(filter);
    }

    /**
     * Check if entity exists by filter
     * @param filter - Filter query
     * @returns True if exists, false otherwise
     */
    async exists(filter: any): Promise<boolean> {
        return await this.repository.exists(filter);
    }

    /**
     * Find entities by filter
     * @param filter - Filter query
     * @returns Array of entities
     */
    async findByFilter(filter: any): Promise<T[]> {
        return await this.repository.findMany(filter);
    }

    /**
     * Find one entity by filter
     * @param filter - Filter query
     * @returns Entity or null
     */
    async findOneByFilter(filter: any): Promise<T | null> {
        return await this.repository.findOne(filter);
    }

    /**
     * Find one entity by filter (throws error if not found)
     * @param filter - Filter query
     * @returns Entity
     * @throws NotFoundError if entity not found
     */
    async findOneByFilterOrThrow(filter: any): Promise<T> {
        const entity = await this.repository.findOne(filter);
        if (!entity) {
            throw new NotFoundError(
                `Resource not found with filter: ${JSON.stringify(filter)}`
            );
        }
        return entity;
    }
    /**
     * Validate required fields
     * @param data - Object to validate
     * @param requiredFields - Array of required field names
     * @throws ValidationError if any required field is missing
     */
    protected validateRequiredFields(
        data: any,
        requiredFields: string[]
    ): void {
        const missingFields: string[] = [];

        for (const field of requiredFields) {
            if (
                data[field] === undefined ||
                data[field] === null ||
                data[field] === ''
            ) {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            throw new AppError(
                `Missing required fields: ${missingFields.join(', ')}`,
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }

    /**
     * Validate field length
     * @param value - Value to validate
     * @param fieldName - Name of the field
     * @param minLength - Minimum length
     * @param maxLength - Maximum length
     * @throws ValidationError if length is invalid
     */
    protected validateFieldLength(
        value: string,
        fieldName: string,
        minLength?: number,
        maxLength?: number
    ): void {
        if (minLength !== undefined && value.length < minLength) {
            throw new AppError(
                `${fieldName} must be at least ${minLength} characters`,
                HTTP_STATUS.BAD_REQUEST
            );
        }

        if (maxLength !== undefined && value.length > maxLength) {
            throw new AppError(
                `${fieldName} cannot exceed ${maxLength} characters`,
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }

    /**
     * Validate email format
     * @param email - Email to validate
     * @throws ValidationError if email format is invalid
     */
    protected validateEmail(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError(
                'Please provide a valid email address',
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }

    /**
     * Validate ID format
     * @param id - ID to validate
     * @param fieldName - Name of the field (default: 'ID')
     * @throws ValidationError if ID format is invalid
     */
    protected validateId(id: string, fieldName: string = 'ID'): void {
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            throw new AppError(
                `${fieldName} is required`,
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Check if it's a valid MongoDB ObjectId format
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(id)) {
            throw new AppError(
                `Invalid ${fieldName} format`,
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }

    /**
     * Validate pagination parameters
     * @param page - Page number
     * @param pageSize - Page size
     * @throws ValidationError if pagination parameters are invalid
     */
    protected validatePagination(page: number, pageSize: number): void {
        if (page < 1) {
            throw new AppError(
                'Page number must be greater than 0',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        if (pageSize < 1 || pageSize > 100) {
            throw new AppError(
                'Page size must be between 1 and 100',
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }

    /**
     * Normalize pagination parameters to safe bounds
     * @param page - Page number (optional)
     * @param pageSize - Page size (optional)
     * @returns Normalized pagination parameters
     */
    protected normalizePagination(
        page?: number,
        pageSize?: number
    ): {
        currentPage: number;
        currentPageSize: number;
    } {
        const parsedPage = Number(page);
        const parsedSize = Number(pageSize);

        const currentPage =
            Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

        const normalizedSize =
            Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : 10;
        const currentPageSize = Math.min(normalizedSize, 100);

        return { currentPage, currentPageSize };
    }

    /**
     * Log activity for audit purposes
     * @param userId - User ID performing the action
     * @param action - Action performed
     * @param resourceId - Resource ID affected
     * @param details - Additional details
     */
    protected logActivity(
        userId: string,
        action: string,
        resourceId?: string,
        details?: any
    ): void {
        console.log('Activity Log:', {
            userId,
            action,
            resourceId,
            details,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Handle duplicate key error from database
     * @param error - Database error
     * @param field - Field that caused the duplicate
     * @throws ConflictError with appropriate message
     */
    protected handleDuplicateKeyError(error: any, field: string): void {
        if (error.code === 11000) {
            const value = error.keyValue?.[field] || 'unknown';
            throw new AppError(
                `${field} '${value}' already exists`,
                HTTP_STATUS.CONFLICT
            );
        }
        throw error;
    }

    /**
     * Sanitize input data by removing sensitive fields
     * @param data - Input data
     * @param sensitiveFields - Fields to remove
     * @returns Sanitized data
     */
    protected sanitizeInput(
        data: any,
        sensitiveFields: string[] = ['password', 'token']
    ): any {
        const sanitized = { ...data };
        sensitiveFields.forEach((field) => {
            delete sanitized[field];
        });
        return sanitized;
    }

    /**
     * Transform data for response
     * @param data - Data to transform
     * @param fieldsToRemove - Fields to remove from response
     * @returns Transformed data
     */
    protected transformResponse(
        data: any,
        fieldsToRemove: string[] = ['__v', 'password']
    ): any {
        if (Array.isArray(data)) {
            return data.map((item) =>
                this.transformResponse(item, fieldsToRemove)
            );
        }

        if (data && typeof data === 'object') {
            const transformed = { ...data };
            fieldsToRemove.forEach((field) => {
                delete transformed[field];
            });
            return transformed;
        }

        return data;
    }

    /**
     * Check if user has permission for action
     * @param userId - User ID
     * @param action - Action to perform
     * @param resourceId - Resource ID (optional)
     * @returns Promise<boolean>
     */
    protected async checkPermission(
        userId: string,
        action: string,
        resourceId?: string
    ): Promise<boolean> {
        // This is a placeholder for permission checking logic
        // In a real application, this would check against user roles, permissions, etc.
        console.log('Permission check:', { userId, action, resourceId });
        return true; // Placeholder - always return true for now
    }

    /**
     * Generate slug from text
     * @param text - Text to convert to slug
     * @returns Generated slug
     */
    protected generateSlug(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    /**
     * Format error message for logging
     * @param error - Error object
     * @param context - Additional context
     * @returns Formatted error message
     */
    protected formatErrorMessage(error: any, context?: any): string {
        return `Error: ${error.message} | Context: ${JSON.stringify(
            context
        )} | Stack: ${error.stack}`;
    }

    /**
     * Create success response data
     * @param data - Response data
     * @param message - Success message
     * @param meta - Additional metadata
     * @returns Formatted success response
     */
    protected createSuccessResponse(
        data: any,
        message: string,
        meta?: any
    ): any {
        return {
            success: true,
            message,
            data: this.transformResponse(data),
            meta,
            timestamp: new Date().toISOString(),
        };
    }
}
