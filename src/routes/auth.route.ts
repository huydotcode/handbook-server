import { Router } from 'express';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';
import { AuthController } from '../controllers/auth.controller';
import {
    loginValidation,
    resetPasswordValidation,
    signUpValidation,
    googleLoginValidation,
    sendOtpValidation,
} from '../validations/auth.validation';

const authRouter = Router();
const authController = new AuthController();

const authRoutes: IApiRoute[] = [
    {
        path: '/login',
        method: EApiMethod.POST,
        controller: authController.login,
        validate: {
            body: loginValidation,
        },
    },
    {
        path: '/register',
        method: EApiMethod.POST,
        controller: authController.register,
        isRateLimited: true,
        validate: {
            body: signUpValidation,
        },
    },
    {
        path: '/refresh',
        method: EApiMethod.POST,
        controller: authController.refresh,
    },
    {
        path: '/logout',
        method: EApiMethod.POST,
        controller: authController.logout,
    },
    {
        path: '/send-otp',
        method: EApiMethod.POST,
        controller: authController.sendOTP,
        validate: {
            body: sendOtpValidation,
        },
    },
    {
        path: '/verify-otp',
        method: EApiMethod.POST,
        controller: authController.verifyOTP,
    },
    {
        path: '/reset-password',
        method: EApiMethod.POST,
        controller: authController.resetPassword,
        validate: {
            body: resetPasswordValidation,
        },
    },
    {
        path: '/google',
        method: EApiMethod.POST,
        controller: authController.loginWithGoogle,
        validate: {
            body: googleLoginValidation,
        },
    },
];

addRoutes(authRouter, authRoutes);

export default authRouter;
