import { createTransporter } from './mailer';
import { getOtpEmailHtml } from '../emails/templates';
import { env } from '../config';

export enum EMailType {
    REGISTER = 'register',
    FORGOT_PASSWORD = 'forgot-password',
}

export async function sendOtpEmail(
    to: string,
    otp: string,
    type: EMailType
): Promise<void> {
    const transporter = await createTransporter();

    const subject =
        type === EMailType.REGISTER
            ? '[HANDBOOK] - OTP Đăng ký tài khoản'
            : '[HANDBOOK] - OTP Đặt lại mật khẩu';

    const html = getOtpEmailHtml(otp, type);

    const mailOptions = {
        from: `"Handbook" <${env.GMAIL_USER}>`,
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
}
