import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { env } from '../config';
import redis from '../utils/redis';

/**
 * Custom rate limiter for AI related endpoints to conserve tokens.
 */
export const aiRateLimiter = rateLimit({
    windowMs: Number(env.AI_LIMIT_HOUR),
    limit: Number(env.AI_LIMIT_MESSAGE),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: async (...args: string[]) => {
            const result = await redis.call(args[0], ...args.slice(1));
            return result as any;
        },
    }),
    message: {
        status: 429,
        message: `Hiện tại bạn chỉ có thể gửi ${env.AI_LIMIT_MESSAGE} tin nhắn mỗi giờ. Vui lòng thử lại sau.`,
    },
    keyGenerator: (req) => {
        return (req as any).user?.id || req.ip || 'unknown';
    },
});
