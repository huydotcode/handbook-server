import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JwtDecoded } from '../common/types/jwt';
import { EUserRole } from '../models/user.model';
import { ResponseUtil } from '../common/utils';
import { env } from '../common/config';

export default async function adminMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return ResponseUtil.unauthorized(res, 'Unauthorized');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return ResponseUtil.unauthorized(res, 'Unauthorized');
    }

    const secretKey = env.JWT_SECRET;

    if (!secretKey) {
        return ResponseUtil.internalError(res, 'Internal server error');
    }

    const decoded = jwt.verify(token, secretKey) as JwtDecoded;

    if (!decoded) {
        return ResponseUtil.unauthorized(res, 'Unauthorized');
    }

    if (decoded.role !== EUserRole.ADMIN) {
        return ResponseUtil.forbidden(res, 'Forbidden');
    }

    next();
}
