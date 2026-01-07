import { z } from "zod";
import { numberField, objectIdField, stringField } from "./common.zod";
import { ServiceMode } from "../../domain/enums/serviceMode.enum";
import { ServiceCategory } from "../../domain/enums/serviceCategories.enum";

// **** user profile controller **** \\
// User update user info controller zod validation
export const UserUpdateInfoZOdSchema = z.object({
    username: stringField("Username", 4, 30, /^[a-zA-Z ]{4,30}$/, "Invalid username"),
    phone: stringField("Phone", 10, 15, /^\+\d{10,15}$/, "Invalid phone number")
})





// **** user provider controller **** \\
// User fetch providers for the dashboard provider listing
export const UserFetchAllProvidersZodSchema = z.object({
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

// User fetch provider address controller zod validation
// user fetch provider service details constoller zod validation
// user fetch provider profile details controller zod validation
// User fetch provider service availability controller zod validation






// **** user booking controller **** \\
// user create a session for appointment booking using stripe zod validation
export const UserCreateSessionIdForbookingViaStripeZodSchema = z.object({
    providerId: objectIdField("Provider ID"),
    slotId: objectIdField("Slot ID"),
    date: z.preprocess((val) => {
        if (typeof val === "string" || val instanceof String) {
            const parsed = new Date(val as string);
            if (!isNaN(parsed.getTime())) return parsed;
        }
        return val;
    }, z.date({
        required_error: "Date is required",
        invalid_type_error: "Date must be a valid Date object",
    })),
    selectedServiceMode: z.nativeEnum(ServiceMode),
});





// **** user review controller **** \\
// user crea review
export const UserCreateReviewZodSchema = z.object({
    providerId: objectIdField("Provider Id"),
    bookingId: objectIdField("Booking Id"),
    reviewText: stringField("Review text", 5, 1000,),
    rating: numberField("Rating", 1, 5),
})