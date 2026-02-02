import { addEmailJob } from '../queues/email.queue';

export enum EMailType {
    REGISTER = 'register',
    FORGOT_PASSWORD = 'forgot_password',
}

export async function sendOtpEmail(
    to: string,
    otp: string,
    type: EMailType
): Promise<void> {
    try {
        await addEmailJob(to, otp, type);
    } catch (error) {
        console.error('Email queuing failed:', error);
        throw new Error('Gửi email thất bại');
    }
}
