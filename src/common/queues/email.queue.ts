import { Queue } from 'bullmq';
import { env } from '../config/env.config';
import { EMailType } from '../utils/mail';

export const emailQueue = new Queue('email-sending', {
    connection: {
        host: env.REDIS_HOST,
        port: Number(env.REDIS_PORT),
        password: env.REDIS_PASSWORD,
    },
});

export const addEmailJob = (to: string, otp: string, type: EMailType) => {
    return emailQueue.add('send-otp', { to, otp, type });
};
