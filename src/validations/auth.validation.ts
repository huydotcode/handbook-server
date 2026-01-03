import { z } from 'zod';
import { EMailType } from '../common/utils/mail';

// Sign up validation
export const signUpValidation = z.object({
    email: z.string().email('Email không hợp lệ'),
    username: z
        .string()
        .min(6, 'Username là chuỗi từ 6-50 kí tự')
        .max(50, 'Username là chuỗi từ 6-50 kí tự')
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            'Username chỉ chứa kí tự, số, dấu gạch dưới và gạch ngang'
        ),
    name: z
        .string()
        .min(6, 'Tên là chuỗi từ 6-50 kí tự')
        .max(50, 'Tên là chuỗi từ 6-50 kí tự'),
    password: z
        .string()
        .min(6, 'Mật khẩu từ 6-50 kí tự')
        .max(50, 'Mật khẩu từ 6-50 kí tự'),
    repassword: z
        .string()
        .min(6, 'Mật khẩu từ 6-50 kí tự')
        .max(50, 'Mật khẩu từ 6-50 kí tự'),
});

export type SignUpValidation = z.infer<typeof signUpValidation>;

// Login validation
export const loginValidation = z.object({
    account: z
        .string()
        .min(1, 'Vui lòng nhập email hoặc tên đăng nhập')
        .refine((value) => {
            if (value.includes('@')) {
                return z.string().email().safeParse(value).success;
            }
            return true;
        }, 'Email không hợp lệ'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export type LoginValidation = z.infer<typeof loginValidation>;

export const resetPasswordValidation = z.object({
    email: z.string().email('Email không hợp lệ'),
    newPassword: z.string().min(6, 'Mật khẩu từ 6-50 kí tự'),
    otp: z.string().min(6, 'OTP phải có 6 chữ số'),
});

export type ResetPasswordValidation = z.infer<typeof resetPasswordValidation>;

// Send OTP validation
export const sendOtpValidation = z.object({
    email: z.string().email('Email không hợp lệ'),
    type: z.enum(Object.values(EMailType)),
});

export type SendOtpValidation = z.infer<typeof sendOtpValidation>;

export const googleLoginValidation = z.object({
    code: z.string().min(1, 'Authorization code is required'),
});

export type GoogleLoginValidation = z.infer<typeof googleLoginValidation>;
