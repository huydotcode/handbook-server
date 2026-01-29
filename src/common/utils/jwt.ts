import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import * as jwtWebToken from 'jsonwebtoken';
import { env } from '../config';

interface Payload {
    id: string;
    name: string;
    email: string;
    picture: string;
    role: string;
    username: string;
    isBlocked?: boolean;
    // iat: number;
    // exp: number;
}

interface RefreshPayload {
    id: string;
    // iat: number;
    // exp: number;
}

const ACCESS_TOKEN_SECRET = env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = env.JWT_REFRESH_SECRET;

export const JWT_EXPIRATION = '15m';
export const JWT_REFRESH_EXPIRATION = '7d';

export const jwt = {
    sign: (payload: Payload): string => {
        return jwtWebToken.sign(payload, ACCESS_TOKEN_SECRET, {
            expiresIn: JWT_EXPIRATION, // Short-lived access token
        });
    },
    verify: (token: string): Payload => {
        return jwtWebToken.verify(token, ACCESS_TOKEN_SECRET) as Payload;
    },
    signRefreshToken: (payload: RefreshPayload): string => {
        return jwtWebToken.sign(payload, REFRESH_TOKEN_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRATION,
        });
    },
    verifyRefreshToken: (token: string): RefreshPayload => {
        return jwtWebToken.verify(
            token,
            REFRESH_TOKEN_SECRET
        ) as RefreshPayload;
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
