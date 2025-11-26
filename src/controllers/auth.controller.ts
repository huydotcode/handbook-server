import { NextFunction, Request, Response } from 'express';

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
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            ResponseUtil.success(
                res,
                { token: result.token },
                'Đăng nhập thành công'
            );
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
}
