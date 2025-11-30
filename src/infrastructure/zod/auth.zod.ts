import { z } from 'zod';
import { roleArray } from '../helpers/constants';
import { strongPasswordRegex, usernameRegex } from './regex';

export const verificationTokenField = z.string({
  required_error: "Verification token is required",
  invalid_type_error: "Verification token must be a string"
});

// Regist controller zod validation
const RegisterZodSchema = z
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
    role: z.enum(roleArray),
  });

// OTP Verification controller zod validation
const OTPVerificationZodSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits"),
  verificationToken: verificationTokenField,
  role: z.enum(roleArray)
});

// Resend otp controller zod validation
const ResendOTPZodSchema = z.object({
  role: z.enum(roleArray),
  verificationToken: verificationTokenField.optional(),
  email: z.string().email("Invalid email address").optional(),
});

// Login controller zod validation
const LoginZodSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password cannot exceed 50 characters")
    .regex(strongPasswordRegex, "Password must contain uppercase, lowercase, number & symbol"),
  role: z.enum(roleArray)
});

// Update password zod validation
const UpdatePasswordZodSchema = z.object({
  role: z.enum(roleArray),
  verificationToken: verificationTokenField.optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password cannot exceed 50 characters")
    .regex(strongPasswordRegex, "Password must contain uppercase, lowercase, number & symbol")
});

export {
  RegisterZodSchema,
  OTPVerificationZodSchema,
  ResendOTPZodSchema,
  LoginZodSchema,
  UpdatePasswordZodSchema
};
