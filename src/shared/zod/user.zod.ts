import { z } from "zod";
import {
    validateUserIdSchema,
    updateInfoSchema,
    s3FileKeySchema,
} from "./base.zod";

// User update file schema
export const userUpdateFileSchema = s3FileKeySchema;

// User update info schema
export const userUpdateInfoSchema = updateInfoSchema;

// User update push notification schema
export const userUpdatePushNotificationSchema = z.object({
    allowPushNotification: z.boolean(),
});