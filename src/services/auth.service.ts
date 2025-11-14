import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import {
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from '../common/errors';
import { jwt } from '../common/utils';
import { EMailType, sendOtpEmail } from '../common/utils/mail';
import redis from '../common/utils/redis';
import User from '../models/user.model';

export interface LoginResult {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        avatar: string;
        role: string;
        username: string;
    };
}

export interface SendOTPResult {
    message: string;
}

export class AuthService {
    /**
     * Login user with email and password
     * @param email - User email
     * @param password - User password
     * @returns Login result with token and user info
     * @throws NotFoundError if user not found
     * @throws UnauthorizedError if password is incorrect
     */
    async login(email: string, password: string): Promise<LoginResult> {
        if (!email || !password) {
            throw new ValidationError('Email và mật khẩu là bắt buộc');
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            throw new NotFoundError('Email không tồn tại trong hệ thống');
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            throw new UnauthorizedError('Mật khẩu không chính xác');
        }

        const token = jwt.sign({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            picture: user.avatar,
            role: user.role,
            username: user.username || '',
        });

        return {
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                role: user.role,
                username: user.username || '',
            },
        };
    }

    /**
     * Send OTP to user email
     * @param email - User email
     * @returns Success message
     * @throws ValidationError if email is not provided
     * @throws NotFoundError if user not found
     */
    async sendOTP(email: string): Promise<SendOTPResult> {
        if (!email) {
            throw new ValidationError('Vui lòng cung cấp email');
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            throw new NotFoundError('Email không tồn tại trong hệ thống');
        }

        // Generate 6-digit OTP
        const otp = randomBytes(3)
            .readUIntBE(0, 3)
            .toString()
            .padStart(6, '0')
            .slice(-6);

        // OTP expires in 5 minutes
        const expiresIn = 5 * 60; // 5 minutes in seconds
        await redis.set(
            `otp:${email.toLowerCase()}`,
            JSON.stringify({ otp, expires: Date.now() + expiresIn * 1000 }),
            'EX',
            expiresIn
        );

        await sendOtpEmail(email, otp, EMailType.REGISTER);

        return {
            message: 'OTP đã được gửi tới email của bạn',
        };
    }

    /**
     * Verify OTP for user email
     * @param email - User email
     * @param otp - OTP code to verify
     * @returns Success message
     * @throws ValidationError if OTP is invalid or expired
     */
    async verifyOTP(email: string, otp: string): Promise<{ message: string }> {
        if (!email || !otp) {
            throw new ValidationError('Email và OTP là bắt buộc');
        }

        const otpData = await redis.get(`otp:${email.toLowerCase()}`);

        if (!otpData) {
            throw new ValidationError('OTP không hợp lệ hoặc đã hết hạn');
        }

        const { otp: storedOtp, expires } = JSON.parse(otpData);

        if (Date.now() > expires) {
            await redis.del(`otp:${email.toLowerCase()}`);
            throw new ValidationError('OTP đã hết hạn');
        }

        if (storedOtp !== otp) {
            throw new ValidationError('OTP không chính xác');
        }

        // Delete OTP after successful verification
        await redis.del(`otp:${email.toLowerCase()}`);

        return {
            message: 'Xác thực OTP thành công',
        };
    }

    /**
     * Reset user password
     * @param email - User email
     * @param newPassword - New password
     * @returns Success message
     * @throws ValidationError if email or password is not provided
     * @throws NotFoundError if user not found
     */
    async resetPassword(
        email: string,
        newPassword: string
    ): Promise<{ message: string }> {
        if (!email || !newPassword) {
            throw new ValidationError(
                'Vui lòng cung cấp email và mật khẩu mới'
            );
        }

        if (newPassword.length < 6) {
            throw new ValidationError('Mật khẩu phải có ít nhất 6 ký tự');
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            throw new NotFoundError('Email không tồn tại trong hệ thống');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return {
            message: 'Mật khẩu đã được cập nhật thành công',
        };
    }
}

export default new AuthService();
