import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JwtDecoded } from '../common/types/jwt';
import { ResponseUtil } from '../common/utils';

export default async function authMiddleware(
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

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        return ResponseUtil.internalError(res, 'Internal server error');
    }

    const decoded = jwt.verify(token, secretKey) as JwtDecoded;
    if (!decoded) {
        return ResponseUtil.unauthorized(res, 'Unauthorized');
    }

    req.user = decoded;
    next();
}
