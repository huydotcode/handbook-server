import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';

export enum EApiMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

export interface ValidationConfig {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

export type IApiRoute<T = RequestHandler, R = any> = {
    path: string;
    method: EApiMethod;
    controller: T;
    middlewares?: RequestHandler[] | RequestHandler;
    mapper?: (req: Request, res: Response, next: NextFunction) => Promise<R>;
    wrapResponse?: boolean;
    isPrivateRoute?: boolean;
    isRateLimited?: boolean;
    isAdminRoute?: boolean;
    validate?: ValidationConfig;
};
