export interface BaseEntity {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginationParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    statusCode?: number;
}

export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
    statusCode: number;
    details?: any;
}
