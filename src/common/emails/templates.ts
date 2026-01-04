import { EMailType } from '../utils/mail';

export const getOtpEmailHtml = (otp: string, type: EMailType) => {
    const action =
        type === EMailType.REGISTER ? 'Đăng ký tài khoản' : 'Đặt lại mật khẩu';

    return `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>[HANDBOOK] - ${action}</h2>
            <p>Chào bạn,</p>
            <p>Mã OTP của bạn là: <strong style="color: #d32f2f; font-size: 18px;">${otp}</strong></p>
            <p>Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
            <hr/>
            <small>Đây là email tự động, vui lòng không trả lời lại.</small>
        </div>
    `;
};
