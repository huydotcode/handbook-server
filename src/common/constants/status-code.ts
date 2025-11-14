/**
 * HTTP Status Codes Constants
 * Centralized location for all HTTP status codes used in the application
 */

export const HTTP_STATUS = {
    // 2xx Success
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // 3xx Redirection
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,

    // 4xx Client Error
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    CONFLICT: 409,
    GONE: 410,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    // 5xx Server Error
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

/**
 * Status code ranges for categorization
 */
export const STATUS_RANGES = {
    SUCCESS: { min: 200, max: 299 },
    REDIRECTION: { min: 300, max: 399 },
    CLIENT_ERROR: { min: 400, max: 499 },
    SERVER_ERROR: { min: 500, max: 599 },
} as const;

/**
 * Check if a status code is in a specific range
 */
export const isStatusInRange = (
    statusCode: number,
    range: keyof typeof STATUS_RANGES
): boolean => {
    const { min, max } = STATUS_RANGES[range];
    return statusCode >= min && statusCode <= max;
};

/**
 * Get status text for a given status code
 */
export const getStatusText = (statusCode: number): string => {
    const statusTexts: Record<number, string> = {
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        204: 'No Content',
        301: 'Moved Permanently',
        302: 'Found',
        304: 'Not Modified',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        409: 'Conflict',
        410: 'Gone',
        422: 'Unprocessable Entity',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
    };

    return statusTexts[statusCode] || 'Unknown Status';
};
