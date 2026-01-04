import { NextFunction, Request, Response, RequestHandler } from 'express';

export const catchAsync =
    (fn: RequestHandler) =>
    (req: Request, res: Response, next: NextFunction): Promise<void> => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };

export default catchAsync;
