import { z } from 'zod';
import { validateUserIdSchema } from './user.zod';
import { roleValidationSchema } from './base.zod';
import { strongPasswordRegex, usernameRegex } from '../utils/regex';

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
  });

// OTP Verification controller zod validation
export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits"),
});

// Login controller zod validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password cannot exceed 50 characters")
    .regex(strongPasswordRegex, "Password must contain uppercase, lowercase, number & symbol"),
});

// Verify email zod validation
export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Update password zod validation
export const updatePasswordSchema = z.object({
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