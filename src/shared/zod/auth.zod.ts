import { z } from 'zod';
import { roleValidationSchema } from './base.zod';
import { strongPasswordRegex, usernameRegex } from '../utils/constants/regex';
import { HearAboutUsOptionValue } from '../../domain/enums/common.enum';

// Regist controller zod validation
export const registerSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password cannot exceed 50 characters")
      .regex(strongPasswordRegex, "Password must contain uppercase, lowercase, number & symbol"),
    timeZone: z.object({
      value: z.string(),
      label: z.string(),
      offset: z.number(),
      abbrev: z.string(),
      altName: z.string(),
    }),
  });

// OTP Verification controller zod validation
export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits"),
});

// Login controller zod validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password cannot exceed 50 characters")
    .regex(strongPasswordRegex, "Password must contain uppercase, lowercase, number & symbol"),
});

// Verify email zod validation
export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email"),
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
export const profileSetupSchema = z.object({
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(usernameRegex, "Invalid Username format"),
  whereDidHearAboutUs: z.enum(HearAboutUsOptionValue),
  referralCode: z.string().startsWith("SF_REF").min(12).max(15).optional(),
}).merge(roleValidationSchema);

// google auth /auth/google state for redicting route
export const googleAuthSchema = z.object({
  redirectingRoute: z.enum(['login', 'register'])
})