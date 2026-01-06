import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError } from '../common/errors/app.error';

import { env } from '../common/config/env.config';

export const verifyInternalSecret = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const internalSecret = req.headers['x-internal-secret'];
    const expectedSecret = env.INTERNAL_SECRET_KEY;

    if (!expectedSecret) {
        console.error(
            'INTERNAL_SECRET_KEY is not defined in environment variables'
        );
        throw new AppError(
            'Internal server error configuration',
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }

    if (!internalSecret || internalSecret !== expectedSecret) {
        throw new AppError(
            'Unauthorized internal access',
            HTTP_STATUS.UNAUTHORIZED
        );
    }

    next();
};
