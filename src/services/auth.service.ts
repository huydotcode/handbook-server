import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { google } from 'googleapis';

import {
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from '../common/errors';
import { EAuthType } from '../models/user.model';
import { jwt } from '../common/utils';
import { EMailType, sendOtpEmail } from '../common/utils/mail';
import redis from '../common/utils/redis';
import Profile from '../models/profile.model';
import { UserRepository } from '../repositories';

export interface LoginResult {
    accessToken: string;
    refreshToken: string;
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

export interface RegisterDto {
    email: string;
    username: string;
    name: string;
    password: string;
    avatar?: string;
}

export interface RegisterResult {
    message: string;
    user: {
        id: string;
        email: string;
        name: string;
        username: string;
        avatar: string;
    };
}

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }
    /**
     * Login user with email/username and password
     * @param account - User email or username
     * @param password - User password
     * @returns Login result with token and user info
     * @throws NotFoundError if user not found
     * @throws UnauthorizedError if password is incorrect
     */
    async login(account: string, password: string): Promise<LoginResult> {
        if (!account || !password) {
            throw new ValidationError('Tài khoản và mật khẩu là bắt buộc');
        }

        const user = await this.userRepository.findByEmailOrUsername(
            account.toLowerCase()
        );

        if (!user) {
            throw new NotFoundError(
                'Tài khoản hoặc mật khẩu của bạn không chính xác'
            );
        }

        if (!user.password || !password) {
            throw new UnauthorizedError(
                'Tài khoản hoặc mật khẩu của bạn không chính xác'
            );
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new UnauthorizedError(
                'Tài khoản hoặc mật khẩu của bạn không chính xác'
            );
        }

        const accessToken = jwt.sign({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            picture: user.avatar,
            role: user.role,
            username: user.username || '',
        });

        const refreshToken = jwt.signRefreshToken({
            id: user._id.toString(),
        });

        return {
            accessToken,
            refreshToken,
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
     * Refresh access token using refresh token
     * @param refreshToken - Refresh token from cookie
     * @returns New access token
     * @throws UnauthorizedError if refresh token is invalid
     * @throws NotFoundError if user not found
     */
    async refreshAccessToken(
        refreshToken: string
    ): Promise<{ accessToken: string }> {
        try {
            // Verify refresh token
            const payload = jwt.verifyRefreshToken(refreshToken);

            // Get user from database
            const user = await this.userRepository.findById(payload.id);

            if (!user) {
                throw new NotFoundError('Người dùng không tồn tại');
            }

            // Generate new access token
            const accessToken = jwt.sign({
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                picture: user.avatar,
                role: user.role,
                username: user.username || '',
            });

            return { accessToken };
        } catch (error) {
            throw new UnauthorizedError('Refresh token không hợp lệ');
        }
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

        const user = await this.userRepository.findByEmail(email.toLowerCase());

        if (!user) {
            throw new NotFoundError('Tài khoản không tồn tại');
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

        const user = await this.userRepository.findByEmail(email.toLowerCase());

        if (!user) {
            throw new NotFoundError('Tài khoản không tồn tại');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return {
            message: 'Mật khẩu đã được cập nhật thành công',
        };
    }

    /**
     * Register a new user
     * @param payload - User registration data
     */
    async register(payload: RegisterDto): Promise<RegisterResult> {
        const { email, username, name, password, avatar } = payload;

        if (!email || !username || !name || !password) {
            throw new ValidationError(
                'Email, tên đăng nhập, họ tên và mật khẩu là bắt buộc'
            );
        }

        if (password.length < 6) {
            throw new ValidationError('Mật khẩu phải có ít nhất 6 ký tự');
        }

        const normalizedEmail = email.toLowerCase();
        const normalizedUsername = username.toLowerCase();

        const existingUser = await this.userRepository.findOne({
            $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
        });

        if (existingUser) {
            throw new ValidationError('Email hoặc tên đăng nhập đã tồn tại');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.userRepository.create({
            email: normalizedEmail,
            username: normalizedUsername,
            name,
            password: hashedPassword,
            avatar: avatar || '/assets/img/user-profile.jpg',
        });

        await Profile.create({
            user: user._id,
            coverPhoto: '/assets/img/cover-page.jpg',
            bio: '',
            work: '',
            education: '',
            location: '',
            dateOfBirth: new Date(),
        });

        return {
            message: 'Đăng ký thành công',
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                username: user.username,
                avatar: user.avatar,
            },
        };
    }

    /**
     * Login with Google
     * @param code - Authorization code from Google
     */
    async loginWithGoogle(code: string): Promise<LoginResult> {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'postmessage'
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2',
        });

        const { data } = await oauth2.userinfo.get();

        if (!data.email || !data.id) {
            throw new ValidationError('Không thể lấy thông tin từ Google');
        }

        let user = await this.userRepository.findByEmail(data.email);

        if (!user) {
            // Create new user
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            let username = data.email.split('@')[0];

            // Check if username exists
            const existingUsername = await this.userRepository.findOne({
                username,
            });

            if (existingUsername) {
                username += Math.floor(Math.random() * 1000);
            }

            user = (await this.userRepository.create({
                email: data.email,
                name: data.name || 'User',
                username: username,
                password: hashedPassword,
                avatar: data.picture || '/assets/img/user-profile.jpg',
                authType: EAuthType.GOOGLE,
                googleId: data.id,
                isVerified: true,
            })) as any;

            if (user) {
                await Profile.create({
                    user: user._id,
                    coverPhoto: '/assets/img/cover-page.jpg',
                    bio: '',
                    work: '',
                    education: '',
                    location: '',
                    dateOfBirth: new Date(),
                });
            }
        } else {
            if (!user.googleId) {
                user.googleId = data.id;
                user.authType = EAuthType.GOOGLE;
                await user.save();
            }
        }

        const accessToken = jwt.sign({
            id: user!._id.toString(),
            email: user!.email,
            name: user!.name,
            picture: user!.avatar,
            role: user!.role,
            username: user!.username || '',
        });

        const refreshToken = jwt.signRefreshToken({
            id: user!._id.toString(),
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user!._id.toString(),
                email: user!.email,
                name: user!.name,
                avatar: user!.avatar,
                role: user!.role,
                username: user!.username || '',
            },
        };
    }
}

export default new AuthService();
