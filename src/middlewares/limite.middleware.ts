import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore, { RedisReply } from 'rate-limit-redis';
import redis, { isRedisReady } from '../common/utils/redis';
import { env } from '../common/config';

// Create the rate limiter instance
const limiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args: string[]) =>
            redis.call(
                ...(args as [string, ...string[]])
            ) as Promise<RedisReply>,
    }),
    windowMs: 60 * 1000, // 1 minute
    max: env.NODE_ENV === 'production' ? 50 : 1000,
    message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Wrapper middleware that checks Redis status
const limiteMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Graceful degradation: If Redis is not ready, skip rate limiting
    if (!isRedisReady()) {
        // Optional: log warning once in a while to avoid spamming logs
        return next();
    }
    return limiter(req, res, next);
};

export default limiteMiddleware;
