import { z } from "zod";
import { objectIdRegex } from "../utils/regex";
import { ServiceCategory, ServiceMode } from "../../domain/enums/service.enum";
import {
    validateUserIdSchema,
    paginationSchema,
    dateSchema,
    addressSchema,
    updateInfoSchema,
    saveStripePaymentSchema,
    s3FileKeySchema,
    validateBookingIdSchema,
    validateProviderIdSchema,
    validateReviewIdSchema
} from "./base.zod";
// import { fetchBookingCommonSchema } from "./common.zod";
import { Role } from "../../domain/enums/common.enum";

//
export const userIdWithPaginationSchema = validateUserIdSchema.merge(paginationSchema);

// User fetch providers for the dashboard provider listing
export const userFetchAllProvidersSchema = z.object({
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

// user create a session for appointment booking using stripe zod validation
export const userCreateSessionIdForbookingViaStripeSchema = z.object({
    slotId: z.string().regex(objectIdRegex, "Invalid slot id"),
    date: dateSchema,
    selectedServiceMode: z.nativeEnum(ServiceMode),
}).merge(validateUserIdSchema).merge(validateProviderIdSchema);

// user crea review


// user delete review
export const userDeleteReviewSchema = validateUserIdSchema.merge(validateReviewIdSchema);

//
export const userCreateAddressSchema = addressSchema.merge(validateUserIdSchema);

//
export const userUpdateAddressSchema = z.object({
    addressId: z.string().regex(objectIdRegex, "Invalid addressId"),
}).merge(addressSchema).merge(validateUserIdSchema);

//
// export const userFetchAllAppointmentsSchema = fetchBookingCommonSchema.merge(validateUserIdSchema);

//
export const userCancelBookingSchema = validateBookingIdSchema.merge(validateUserIdSchema);

//
export const userSaveBookingSchema = saveStripePaymentSchema.merge(validateUserIdSchema);


//
export const userUpdateFileSchema = s3FileKeySchema.merge(validateUserIdSchema);

//
export const userUpdateInfoSchema = validateUserIdSchema.merge(updateInfoSchema);

//
export const userFetchAllReviewsSchema = z.object({
    userId: z.string().regex(objectIdRegex, "Invalid userId"),
    providerId: z.string().regex(objectIdRegex, "Invalid providerId"),
    role: z.nativeEnum(Role).optional(),
}).merge(paginationSchema);

export const userUpdatePushNotificationSchema = z.object({
    allowPushNotification: z.boolean(),
}).merge(validateUserIdSchema);

export { validateUserIdSchema };