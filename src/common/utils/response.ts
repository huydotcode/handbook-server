import { Response } from 'express';
import { HTTP_STATUS } from '../constants/status-code';
import { SUCCESS_MESSAGES } from '../constants/message-code';

/**
 * Standardized API Response Interface
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        page?: number;
        pageSize?: number;
        total?: number;
        totalPages?: number;
        hasNext?: boolean;
        hasPrev?: boolean;
    };
    timestamp: string;
    path?: string;
}

/**
 * Error Response Interface
 */
export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
    statusCode: number;
    details?: any;
    timestamp: string;
    path?: string;
}

/**
 * Response Utility Class
 * Provides standardized methods for sending API responses
 */
export class ResponseUtil {
    /**
     * Send success response
     */
    static success<T>(
        res: Response,
        data?: T,
        message: string = 'Success',
        statusCode: number = HTTP_STATUS.OK,
        meta?: ApiResponse<T>['meta']
    ): void {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data,
            meta,
            timestamp: new Date().toISOString(),
            path: res.req.originalUrl,
        };

        res.status(statusCode).json(response);
    }

    /**
     * Send created response
     */
    static created<T>(
        res: Response,
        data: T,
        message: string = SUCCESS_MESSAGES.CREATED
    ): void {
        this.success(res, data, message, HTTP_STATUS.CREATED);
    }

    /**
     * Send updated response
     */
    static updated<T>(
        res: Response,
        data: T,
        message: string = SUCCESS_MESSAGES.UPDATED
    ): void {
        this.success(res, data, message, HTTP_STATUS.OK);
    }

    /**
     * Send deleted response
     */
    static deleted(
        res: Response,
        message: string = SUCCESS_MESSAGES.DELETED
    ): void {
        this.success(res, undefined, message, HTTP_STATUS.OK);
    }

    /**
     * Send no content response
     */
    static noContent(res: Response): void {
        res.status(HTTP_STATUS.NO_CONTENT).send();
    }

    /**
     * Send paginated response
     */
    static paginated<T>(
        res: Response,
        data: T[],
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        },
        message: string = SUCCESS_MESSAGES.RETRIEVED
    ): void {
        this.success(res, data, message, HTTP_STATUS.OK, pagination);
    }

    /**
     * Send error response
     */
    static error(
        res: Response,
        message: string,
        statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        details?: any
    ): void {
        const response: ErrorResponse = {
            success: false,
            error: message,
            message,
            statusCode,
            details,
            timestamp: new Date().toISOString(),
            path: res.req.originalUrl,
        };

        res.status(statusCode).json(response);
    }

    /**
     * Send validation error response
     */
    static validationError(
        res: Response,
        message: string,
        details?: any
    ): void {
        this.error(res, message, HTTP_STATUS.BAD_REQUEST, details);
    }

    /**
     * Send not found error response
     */
    static notFound(
        res: Response,
        message: string = 'Resource not found',
        details?: any
    ): void {
        this.error(res, message, HTTP_STATUS.NOT_FOUND, details);
    }

    /**
     * Send unauthorized error response
     */
    static unauthorized(
        res: Response,
        message: string = 'Unauthorized',
        details?: any
    ): void {
        this.error(res, message, HTTP_STATUS.UNAUTHORIZED, details);
    }

    /**
     * Send forbidden error response
     */
    static forbidden(
        res: Response,
        message: string = 'Forbidden',
        details?: any
    ): void {
        this.error(res, message, HTTP_STATUS.FORBIDDEN, details);
    }

    /**
     * Send conflict error response
     */
    static conflict(
        res: Response,
        message: string = 'Conflict',
        details?: any
    ): void {
        this.error(res, message, HTTP_STATUS.CONFLICT, details);
    }

    /**
     * Send too many requests error response
     */
    static tooManyRequests(
        res: Response,
        message: string = 'Too many requests',
        details?: any
    ): void {
        this.error(res, message, HTTP_STATUS.TOO_MANY_REQUESTS, details);
    }

    /**
     * Send internal server error response
     */
    static internalError(
        res: Response,
        message: string = 'Internal server error',
        details?: any
    ): void {
        this.error(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, details);
    }

    /**
     * Send service unavailable error response
     */
    static serviceUnavailable(
        res: Response,
        message: string = 'Service unavailable',
        details?: any
    ): void {
        this.error(res, message, HTTP_STATUS.SERVICE_UNAVAILABLE, details);
    }
}

/**
 * Legacy ApiResponse class for backward compatibility
 * @deprecated Use ResponseUtil instead
 */
export class ApiResponse {
    static success<T>(
        data?: T,
        message: string = 'Success',
        meta?: any
    ): ApiResponse<T> {
        return {
            success: true,
            message,
            data,
            meta,
            timestamp: new Date().toISOString(),
        };
    }

    static error(
        message: string,
        statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        details?: any
    ): ErrorResponse {
        return {
            success: false,
            error: message,
            message,
            statusCode,
            details,
            timestamp: new Date().toISOString(),
        };
    }
}
