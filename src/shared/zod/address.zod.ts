import z from "zod";
import { objectIdRegex } from "../utils/regex";
import { addressSchema, validateUserIdSchema } from "./base.zod";

// Create address validation schema
export const createAddressSchema = addressSchema.merge(validateUserIdSchema);

// Update address validation schema
export const updateAddressSchema = z.object({
    addressId: z.string().regex(objectIdRegex, "Invalid addressId"),
}).merge(addressSchema);

// get address validation schema
export const getAddressSchema = z.object({
    userId: z.string().regex(objectIdRegex, "Invalid addressId").optional(),
    providerId: z.string().regex(objectIdRegex, "Invalid addressId").optional(),
})