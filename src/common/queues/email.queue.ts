import { Queue } from 'bullmq';
import redis from '../utils/redis';
import { EMailType } from '../utils/mail';

// Lazy initialization - only create queue when first needed
let emailQueueInstance: Queue | null = null;

const getEmailQueue = (): Queue => {
    if (!emailQueueInstance) {
        emailQueueInstance = new Queue('email-sending', {
            connection: redis.duplicate(),
        });
        console.log('[EmailQueue] Queue initialized');
    }
    return emailQueueInstance;
};

export const addEmailJob = (to: string, otp: string, type: EMailType) => {
    return getEmailQueue().add('send-otp', { to, otp, type });
};

// Export getter for queue (for graceful shutdown if needed)
export const getQueue = () => emailQueueInstance;
