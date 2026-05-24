import { z } from 'zod';
import { roleValidationSchema } from './base.zod';
import { strongPasswordRegex, usernameRegex } from '../utils/regex';
import { HearAboutUsOptionValue } from '../../domain/enums/common.enum';

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

// Connect google account zod validation schema
export const connectGoogleSchema = z.object({
  connectOnly: z.boolean(),
}).merge(roleValidationSchema)

// preboardgin zod schema
export const preboardingSchema = z.object({
  whereDidHearAboutUs: z.enum(HearAboutUsOptionValue),
  referralCode: z.string().startsWith("SF_REF").min(12).max(15).optional()
}).merge(roleValidationSchema);
