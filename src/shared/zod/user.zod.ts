import { z } from "zod";
import {
    s3FileKeySchema,
} from "./base.zod";
import { phoneRegex, strongPasswordRegex, usernameRegex } from "../utils/constants/regex";

// User update file schema
export const userUpdateFileSchema = s3FileKeySchema;

// User update info schema
export const userUpdateInfoSchema = z.object({
    username: z.string().min(4).max(30).regex(usernameRegex, "Invalid username"),
    phone: z.string().min(4).max(30).regex(phoneRegex, "Invalid phone number"),
    timeZone: z.object({
        value: z.string(),
        label: z.string(),
        offset: z.number(),
        abbrev: z.string(),
        altName: z.string(),
    }),
});

// user update password schema
export const userUpdatePasswordSchema = z.object({
    currentPassword: z.string().regex(strongPasswordRegex, "Invalid current password"),
    newPassword: z.string()
        .min(8, "New Password must be at least 8 characters")
        .max(50, "New Password cannot exceed 50 characters")
        .regex(strongPasswordRegex, "New Password must contain uppercase, lowercase, number & symbol"),
})

export const timeZoneSchema = z.object({
    value: z.string(),
    label: z.string(),
    offset: z.number(),
    abbrev: z.string(),
    altName: z.string(),
});