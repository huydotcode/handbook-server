/**
 * Message System
 * Centralized error messages for consistent API responses
 */

export interface ErrorMessage {
    message: string;
    statusCode: number;
}

/**
 * Authentication & Authorization Messages
 */
export const AUTH_MESSAGES = {
    // Authentication
    INVALID_CREDENTIALS: {
        message: 'Invalid email or password',
        statusCode: 401,
    },
    TOKEN_EXPIRED: {
        message: 'Access token has expired',
        statusCode: 401,
    },
    TOKEN_INVALID: {
        message: 'Invalid access token',
        statusCode: 401,
    },
    TOKEN_MISSING: {
        message: 'Access token is required',
        statusCode: 401,
    },
    LOGIN_REQUIRED: {
        message: 'Please log in to access this resource',
        statusCode: 401,
    },
    REFRESH_TOKEN_INVALID: {
        message: 'Invalid refresh token',
        statusCode: 401,
    },
    REFRESH_TOKEN_EXPIRED: {
        message: 'Refresh token has expired',
        statusCode: 401,
    },

    // Authorization
    INSUFFICIENT_PERMISSIONS: {
        message: 'You do not have permission to perform this action',
        statusCode: 403,
    },
    ADMIN_REQUIRED: {
        message: 'Admin privileges required',
        statusCode: 403,
    },
    MODERATOR_REQUIRED: {
        message: 'Moderator privileges required',
        statusCode: 403,
    },
    ACCOUNT_SUSPENDED: {
        message: 'Your account has been suspended',
        statusCode: 403,
    },
    ACCOUNT_INACTIVE: {
        message: 'Your account is inactive',
        statusCode: 403,
    },
} as const;

/**
 * Validation Messages
 */
export const VALIDATION_MESSAGES = {
    REQUIRED_FIELD: {
        message: 'This field is required',
        statusCode: 400,
    },
    INVALID_EMAIL: {
        message: 'Please provide a valid email address',
        statusCode: 400,
    },
    INVALID_PASSWORD: {
        message: 'Password must be at least 6 characters long',
        statusCode: 400,
    },
    INVALID_USERNAME: {
        message:
            'Username must be 3-30 characters and contain only letters, numbers, and underscores',
        statusCode: 400,
    },
    INVALID_PHONE: {
        message: 'Please provide a valid phone number',
        statusCode: 400,
    },
    INVALID_DATE: {
        message: 'Please provide a valid date',
        statusCode: 400,
    },
    INVALID_URL: {
        message: 'Please provide a valid URL',
        statusCode: 400,
    },
    INVALID_ID: {
        message: 'Invalid ID format',
        statusCode: 400,
    },
    STRING_TOO_LONG: {
        message: 'Text is too long',
        statusCode: 400,
    },
    STRING_TOO_SHORT: {
        message: 'Text is too short',
        statusCode: 400,
    },
    INVALID_FILE_TYPE: {
        message: 'Invalid file type',
        statusCode: 400,
    },
    FILE_TOO_LARGE: {
        message: 'File size exceeds limit',
        statusCode: 400,
    },
} as const;

/**
 * Resource Messages
 */
export const RESOURCE_MESSAGES = {
    NOT_FOUND: {
        message: 'Resource not found',
        statusCode: 404,
    },
    ALREADY_EXISTS: {
        message: 'Resource already exists',
        statusCode: 409,
    },
    DELETED: {
        message: 'Resource has been deleted',
        statusCode: 410,
    },
    UNAVAILABLE: {
        message: 'Resource is currently unavailable',
        statusCode: 503,
    },
    ACCESS_DENIED: {
        message: 'Access to this resource is denied',
        statusCode: 403,
    },
    RATE_LIMITED: {
        message: 'Too many requests, please try again later',
        statusCode: 429,
    },
} as const;

/**
 * Database Messages
 */
export const DATABASE_MESSAGES = {
    CONNECTION_FAILED: {
        message: 'Database connection failed',
        statusCode: 500,
    },
    QUERY_FAILED: {
        message: 'Database query failed',
        statusCode: 500,
    },
    DUPLICATE_KEY: {
        message: 'Duplicate key error',
        statusCode: 409,
    },
    CONSTRAINT_VIOLATION: {
        message: 'Database constraint violation',
        statusCode: 400,
    },
    TRANSACTION_FAILED: {
        message: 'Database transaction failed',
        statusCode: 500,
    },
} as const;

/**
 * External Service Messages
 */
export const EXTERNAL_MESSAGES = {
    SERVICE_UNAVAILABLE: {
        message: 'External service is unavailable',
        statusCode: 503,
    },
    API_LIMIT_EXCEEDED: {
        message: 'External API rate limit exceeded',
        statusCode: 429,
    },
    INVALID_API_KEY: {
        message: 'Invalid external API key',
        statusCode: 401,
    },
    TIMEOUT: {
        message: 'External service timeout',
        statusCode: 504,
    },
} as const;

/**
 * System Messages
 */
export const SYSTEM_MESSAGES = {
    INTERNAL_ERROR: {
        message: 'Internal server error',
        statusCode: 500,
    },
    MAINTENANCE: {
        message: 'System is under maintenance',
        statusCode: 503,
    },
    FEATURE_DISABLED: {
        message: 'This feature is currently disabled',
        statusCode: 503,
    },
    CONFIGURATION_ERROR: {
        message: 'System configuration error',
        statusCode: 500,
    },
} as const;

/**
 * All error messages combined
 */
export const ERROR_MESSAGES = {
    ...AUTH_MESSAGES,
    ...VALIDATION_MESSAGES,
    ...RESOURCE_MESSAGES,
    ...DATABASE_MESSAGES,
    ...EXTERNAL_MESSAGES,
    ...SYSTEM_MESSAGES,
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    RETRIEVED: 'Resource retrieved successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTRATION_SUCCESS: 'Registration successful',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
    EMAIL_VERIFIED: 'Email verified successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
} as const;
