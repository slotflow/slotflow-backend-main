import { z } from 'zod';
import { validateUserIdSchema } from './user.zod';
import { roleValidationSchema } from './base.zod';
import { Role } from '../../domain/enums/common.enum';
import { strongPasswordRegex, usernameRegex, verificationTokenRegex } from '../utils/regex';

// Regist controller zod validation
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(4, "Username must be at least 4 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(usernameRegex, "Invalid Username format"),

    email: z.string().email("Invalid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password cannot exceed 50 characters")
      .regex(strongPasswordRegex, "Password must contain uppercase, lowercase, number & symbol"),
    role: z.nativeEnum(Role),
  });

// OTP Verification controller zod validation
export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits"),
  verificationToken: z.string().length(36).regex(verificationTokenRegex, "Invalid token"),
  role: z.nativeEnum(Role),
});

// Resend otp controller zod validation
export const resendOTPSchema = z.object({
  role: z.nativeEnum(Role),
  verificationToken: z.string().length(36).regex(verificationTokenRegex, "Invalid token").optional(),
  email: z.string().email("Invalid email address").optional(),
});

// Login controller zod validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password cannot exceed 50 characters")
    .regex(strongPasswordRegex, "Password must contain uppercase, lowercase, number & symbol"),
  role: z.nativeEnum(Role)
});

// Update password zod validation
export const updatePasswordSchema = z.object({
  role: z.nativeEnum(Role),
  verificationToken: z.string().length(36).regex(verificationTokenRegex, "Invalid token").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password cannot exceed 50 characters")
    .regex(strongPasswordRegex, "Password must contain uppercase, lowercase, number & symbol")
});

//
export const connectGoogleSchema = z.object({
  connectOnly: z.boolean(),
}).merge(validateUserIdSchema).merge(roleValidationSchema)