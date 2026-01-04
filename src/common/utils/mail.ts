import { getOtpEmailHtml } from '../emails/templates';
import { env } from '../config';
import { resend } from './resend';

export enum EMailType {
    REGISTER = 'register',
    FORGOT_PASSWORD = 'forgot_password',
}

export async function sendOtpEmail(
    to: string,
    otp: string,
    type: EMailType
): Promise<void> {
    const subject =
        type === EMailType.REGISTER
            ? '[HANDBOOK] - OTP Đăng ký tài khoản'
            : '[HANDBOOK] - OTP Đặt lại mật khẩu';

    const html = getOtpEmailHtml(otp, type);

    try {
        await resend.emails.send({
            from: `Handbook <${env.RESEND_FROM_EMAIL}>`,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Gửi email thất bại');
    }
}
