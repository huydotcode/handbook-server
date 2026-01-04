import { HTTP_STATUS } from '../constants/status-code';

export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
    public details?: any;

    constructor(message: string, statusCode: number, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Convert to JSON for API response
     */
    toJSON() {
        return {
            success: false,
            error: this.message,
            message: this.message,
            statusCode: this.statusCode,
            details: this.details,
        };
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, HTTP_STATUS.BAD_REQUEST, details);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string, details?: any) {
        super(message, HTTP_STATUS.NOT_FOUND, details);
    }
}

export class ConflictError extends AppError {
    constructor(message: string, details?: any) {
        super(message, HTTP_STATUS.CONFLICT, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string, details?: any) {
        super(message, HTTP_STATUS.UNAUTHORIZED, details);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string, details?: any) {
        super(message, HTTP_STATUS.FORBIDDEN, details);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string, details?: any) {
        super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, details);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string, details?: any) {
        super(message, HTTP_STATUS.BAD_REQUEST, details);
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message: string, details?: any) {
        super(message, HTTP_STATUS.TOO_MANY_REQUESTS, details);
    }
}

export class ServiceUnavailableError extends AppError {
    constructor(message: string, details?: any) {
        super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, details);
    }
}
