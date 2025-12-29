import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JwtDecoded } from '../common/types/jwt';
import { ResponseUtil } from '../common/utils';

export default async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
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

        // jwt.verify throws error on invalid/expired token
        const decoded = jwt.verify(token, secretKey) as JwtDecoded;
        if (!decoded) {
            return ResponseUtil.unauthorized(res, 'Unauthorized');
        }

        req.user = decoded;
        next();
    } catch (error: any) {
        // Handle JWT errors (expired, invalid, malformed)
        if (error.name === 'TokenExpiredError') {
            return ResponseUtil.unauthorized(res, 'Token expired');
        } else if (error.name === 'JsonWebTokenError') {
            return ResponseUtil.unauthorized(res, 'Invalid token');
        } else {
            console.error('Auth middleware error:', error);
            return ResponseUtil.unauthorized(res, 'Authentication failed');
        }
    }
}
