import { z } from "zod";
import {
    updateInfoSchema,
    s3FileKeySchema,
} from "./base.zod";
import { strongPasswordRegex } from "../utils/regex";

// User update file schema
export const userUpdateFileSchema = s3FileKeySchema;

// User update info schema
export const userUpdateInfoSchema = updateInfoSchema;

// User update push notification schema
export const userUpdatePushNotificationSchema = z.object({
    allowPushNotification: z.boolean(),
});

// user update password schema
export const userUpdatePasswordSchema = z.object({
    currentPassword: z.string().regex(strongPasswordRegex, "Invalid current password"),
    newPassword: z.string()
        .min(8, "New Password must be at least 8 characters")
        .max(50, "New Password cannot exceed 50 characters")
        .regex(strongPasswordRegex, "New Password must contain uppercase, lowercase, number & symbol"),
})