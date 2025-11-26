import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const authRouter = Router();
const authController = new AuthController();

const authRoutes: IApiRoute[] = [
    {
        path: '/login',
        method: EApiMethod.POST,
        controller: authController.login,
    },
    {
        path: '/register',
        method: EApiMethod.POST,
        controller: authController.register,
        isRateLimited: true,
    },
    {
        path: '/send-otp',
        method: EApiMethod.POST,
        controller: authController.sendOTP,
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
    },
];

addRoutes(authRouter, authRoutes);

export default authRouter;
