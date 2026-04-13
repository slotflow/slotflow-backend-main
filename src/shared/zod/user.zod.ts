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

// User get providers for the dashboard provider listing
export const userGetProvidersSchema = z.object({
    appServiceIds: z.union([z.string(), z.array(z.string())]).optional(),
    maxPrice: z.coerce.number().optional(),
    minPrice: z.coerce.number().optional(),
    slotflowTrusted: z
        .enum(["true", "false"])
        .transform(val => val === "true")
        .optional(),
    categories: z.nativeEnum(ServiceCategory).array().optional(),
    location: z.object({
        type: z.literal("Point"),
        coordinates: z
            .tuple([z.coerce.number(), z.coerce.number()])
            .refine((arr) => arr.length === 2, "Coordinates must be [lon, lat]"),
    }).optional(),
    skip: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
});


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