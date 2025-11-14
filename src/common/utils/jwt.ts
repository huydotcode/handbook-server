import { IncomingHttpHeaders } from 'http';
import * as jwtWebToken from 'jsonwebtoken';
import { Request } from 'express';

interface Payload {
    id: string;
    name: string;
    email: string;
    picture: string;
    role: string;
    username: string;
    // iat: number;
    // exp: number;
}

export const jwt = {
    sign: (payload: Payload): string => {
        return jwtWebToken.sign(
            payload,
            process.env.JWT_SECRET || 'my-secret',
            {
                expiresIn: '1d',
            }
        );
    },
    verify: (token: string): Payload => {
        return jwtWebToken.verify(
            token,
            process.env.JWT_SECRET || 'my-secret'
        ) as Payload;
    },
};

export const getTokenFromHeaders = (
    headers: IncomingHttpHeaders
): string | null => {
    const authHeader =
        headers.authorization || (headers.Authorization as string);
    if (!authHeader) return null;

    const token = authHeader.split(' ')[1]; // Assuming the format is "Bearer <
    return token || null;
};

export const getDecodedTokenFromHeaders = (
    headers: IncomingHttpHeaders
): Payload | null => {
    const token = getTokenFromHeaders(headers);
    if (!token) return null;

    try {
        return jwt.verify(token);
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
};

export const getDecodedTokenFromRequest = (req: Request): Payload | null => {
    const token = getTokenFromHeaders(
        req.headers as unknown as IncomingHttpHeaders
    );
    if (!token) return null;

    try {
        return jwt.verify(token);
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
};
