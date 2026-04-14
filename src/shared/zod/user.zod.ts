import { z } from "zod";
import { objectIdRegex } from "../utils/regex";
import { ServiceCategory } from "../../domain/enums/service.enum";
import {
    validateUserIdSchema,
    paginationSchema,
    updateInfoSchema,
    saveStripePaymentSchema,
    s3FileKeySchema,
    validateReviewIdSchema
} from "./base.zod";
import { Role } from "../../domain/enums/common.enum";

// 
export const userIdWithPaginationSchema = validateUserIdSchema.merge(paginationSchema);


// user delete review
export const userDeleteReviewSchema = validateUserIdSchema.merge(validateReviewIdSchema);

//
export const userSaveBookingSchema = saveStripePaymentSchema.merge(validateUserIdSchema);


//
export const userUpdateFileSchema = s3FileKeySchema.merge(validateUserIdSchema);

//
export const userUpdateInfoSchema = validateUserIdSchema.merge(updateInfoSchema);

//
export const userGetReviewsSchema = z.object({
    userId: z.string().regex(objectIdRegex, "Invalid userId"),
    providerId: z.string().regex(objectIdRegex, "Invalid providerId"),
    role: z.nativeEnum(Role).optional(),
}).merge(paginationSchema);

export const userUpdatePushNotificationSchema = z.object({
    allowPushNotification: z.boolean(),
}).merge(validateUserIdSchema);

export { validateUserIdSchema };