import { Request, Response, NextFunction, RequestHandler } from 'express';

export enum EApiMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
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
};
