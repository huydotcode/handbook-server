import { NextFunction, Request, Response } from 'express';

import { env } from '../common/config';
import { ResponseUtil } from '../common/utils';
import authService from '../services/auth.service';

export class AuthController {
    /**
     * Login user
     * POST /api/v1/auth/login
     */
    public login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { account, password } = req.body;

            const result = await authService.login(account, password);

            // Set refresh token in httpOnly cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            ResponseUtil.success(
                res,
                { accessToken: result.accessToken, user: result.user },
                'Đăng nhập thành công'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Refresh access token
     * POST /api/v1/auth/refresh
     */
    public refresh = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                ResponseUtil.error(res, 'Không tìm thấy refresh token', 401);
                return;
            }

            const result = await authService.refreshAccessToken(refreshToken);

            ResponseUtil.success(
                res,
                { accessToken: result.accessToken },
                'Refresh token thành công'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Logout user
     * POST /api/v1/auth/logout
     */
    public logout = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            // Clear refresh token cookie
            res.clearCookie('refreshToken');

            ResponseUtil.success(res, null, 'Đăng xuất thành công');
        } catch (error) {
            next(error);
        }
    };

    /**
     * Register new user
     * POST /api/v1/auth/register
     */
    public register = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const result = await authService.register(req.body);

            ResponseUtil.success(res, result.user, result.message);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Send OTP to user email
     * POST /api/v1/auth/send-otp
     */
    public sendOTP = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { email } = req.body;

            const result = await authService.sendOTP(email);

            ResponseUtil.success(res, result, result.message);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Verify OTP
     * POST /api/v1/auth/verify-otp
     */
    public verifyOTP = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { email, otp } = req.body;

            const result = await authService.verifyOTP(email, otp);

            ResponseUtil.success(res, result, result.message);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Reset password
     * POST /api/v1/auth/reset-password
     */
    public resetPassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { email, newPassword } = req.body;

            const result = await authService.resetPassword(email, newPassword);

            ResponseUtil.success(res, result, result.message);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Login with Google
     * POST /api/v1/auth/google
     */
    public loginWithGoogle = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { code } = req.body;

            const result = await authService.loginWithGoogle(code);

            // Set refresh token in httpOnly cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            ResponseUtil.success(
                res,
                { accessToken: result.accessToken, user: result.user },
                'Đăng nhập Google thành công'
            );
        } catch (error) {
            next(error);
        }
    };
}
