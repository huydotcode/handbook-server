import { Request } from 'express';
import { getDecodedTokenFromHeaders } from './jwt';
import { UnauthorizedError, AppError } from '../errors/app.error';
import { HTTP_STATUS } from '../constants/status-code';

/**
 * Get pagination parameters from request query
 * @param req - Express request object
 * @param defaultPageSize - Default page size (default: 10)
 * @returns Normalized pagination parameters
 */
export function getPaginationParams(
    req: Request,
    defaultPageSize: number = 10
): { page: number; pageSize: number } {
    const pageStr =
        (req.query.page as string) || (req.query.pageNumber as string) || '1';
    const pageSizeStr =
        (req.query.page_size as string) ||
        (req.query.pageSize as string) ||
        (req.query.limit as string) ||
        String(defaultPageSize);

    const page = parseInt(pageStr, 10);
    const pageSize = parseInt(pageSizeStr, 10);

    return {
        page: Number.isNaN(page) || page < 1 ? 1 : page,
        pageSize:
            Number.isNaN(pageSize) || pageSize < 1
                ? defaultPageSize
                : Math.min(pageSize, 100), // Max 100 items per page
    };
}

/**
 * Get authenticated user ID from request
 * Checks req.user first, then falls back to token in headers
 * @param req - Express request object
 * @returns User ID
 * @throws UnauthorizedError if user is not authenticated
 */
export function getAuthenticatedUserId(req: Request): string {
    if (req.user?.id) {
        return req.user.id;
    }

    const decoded = getDecodedTokenFromHeaders(req.headers);
    if (decoded?.id) {
        return decoded.id;
    }

    throw new UnauthorizedError('Unauthorized');
}

/**
 * Get user ID from request (optional)
 * Returns undefined if not authenticated
 * @param req - Express request object
 * @returns User ID or undefined
 */
export function getOptionalUserId(req: Request): string | undefined {
    if (req.user?.id) {
        return req.user.id;
    }

    const decoded = getDecodedTokenFromHeaders(req.headers);
    return decoded?.id;
}

/**
 * Validate required parameter
 * @param value - Parameter value
 * @param paramName - Parameter name for error message
 * @throws AppError if parameter is missing
 */
export function validateRequiredParam(
    value: any,
    paramName: string
): asserts value is string {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        throw new AppError(`${paramName} is required`, HTTP_STATUS.BAD_REQUEST);
    }
}

/**
 * Validate required body field
 * @param body - Request body
 * @param fieldName - Field name
 * @throws AppError if field is missing
 */
export function validateRequiredBodyField(body: any, fieldName: string): void {
    if (
        !body ||
        body[fieldName] === undefined ||
        body[fieldName] === null ||
        (typeof body[fieldName] === 'string' &&
            body[fieldName].trim().length === 0)
    ) {
        throw new AppError(`${fieldName} is required`, HTTP_STATUS.BAD_REQUEST);
    }
}
