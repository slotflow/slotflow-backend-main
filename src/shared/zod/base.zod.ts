import { z } from "zod";
import { Role } from "../../domain/enums/common.enum";
import { parseDate } from "../utils/helpers/parseDate";
import { addressLineRegex, cityRegex, countryRegex, dateOnlyRegex, districtRegex, landMarkRegex, objectIdRegex, phoneRegex, pincodeRegex, placeRegex, sessionIdRegex, stateRegex, usernameRegex } from "../utils/constants/regex";

// Base ID validation schemas
export const validateUserIdSchema = z.object({
    userId: z.string().regex(objectIdRegex, "Invalid userId"),
});

export const validateProviderIdSchema = z.object({
    providerId: z.string().regex(objectIdRegex, "Invalid providerId"),
});

export const validateSubscriptionIdSchema = z.object({
    subscriptionId: z.string().regex(objectIdRegex, "Invalid subscriptionId"),
});

// Role validation
export const roleValidationSchema = z.object({
    role: z.nativeEnum(Role)
});

// Pagination zod schema with default values
export const paginationSchema = z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").max(100, "Page must be at most 100").optional().default(1),
    limit: z.coerce.number().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").optional().default(10),
});


/**
 * Date-Only String Schema ("YYYY-MM-DD")
 * Keeps date-only values as validated string primitives for calendar/timezone-aware filters.
 * Rejects invalid calendar dates (e.g., "2026-02-31").
 */
export const dateOnlySchema = z.string().refine(
  (val) => {
    if (!dateOnlyRegex.test(val)) return false;
    try {
      // Validate real calendar date (prevents rollover like Feb 31 -> March)
      const parsed = parseDate(val);
      return !isNaN(parsed.getTime());
    } catch {
      return false;
    }
  },
  { message: "Invalid calendar date format. Expected YYYY-MM-DD." }
);

export const dateTimeSchema = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") {
    return val; // Pass through to Zod so required/optional rules handle it cleanly
  }
  if (typeof val === "string" || typeof val === "number" || val instanceof Date) {
    try {
      return parseDate(val);
    } catch {
      return val; // Invalid parse returns original val to trigger Zod validation error
    }
  }
  return val;
}, z.date("Invalid datetime value provided."));

// Address validation
export const addressSchema = z.object({
    addressLine: z
        .string()
        .min(10, "Address line must be at least 10 characters")
        .max(150, "Address line cannot exceed 150 characters")
        .regex(
            addressLineRegex,
            "Address line must be 10–150 characters long and can include letters, numbers, spaces, and . , # -"
        ),
    landmark: z
        .string()
        .min(5, "Landmark line must be at least 5 characters")
        .max(150, "Landmark line cannot exceed 150 characters")
        .regex(
            landMarkRegex,
            "Landmark must be 5–150 characters long and can include letters, numbers, spaces, and . , # -"
        ),
    phone: z
        .string()
        .min(7, "Phone number must be at least 7 characters")
        .max(20, "Phone number cannot exceed 20 characters")
        .regex(
            phoneRegex,
            "Invalid phone number. Only digits, spaces, dashes (-), dots (.), parentheses (), and an optional + are allowed."
        ),
    place: z
        .string()
        .min(3, "Place must be at least 3 characters")
        .max(50, "Place cannot exceed 50 characters")
        .regex(placeRegex, "Place can only include letters, spaces, dots, and hyphens"),
    city: z
        .string()
        .min(3, "City must be at least 3 characters")
        .max(50, "City cannot exceed 50 characters")
        .regex(cityRegex, "City must only contain letters and spaces"),
    district: z
        .string()
        .min(3, "District must be at least 3 characters")
        .max(50, "District cannot exceed 50 characters")
        .regex(districtRegex, "District must only contain letters and spaces"),
    pincode: z
        .string()
        .min(3, "Postal code must be at least 3 characters")
        .max(12, "Postal code cannot exceed 12 characters")
        .regex(pincodeRegex, "Invalid postal code"),
    state: z
        .string()
        .min(2, "State must be at least 2 characters")
        .max(50, "State cannot exceed 50 characters")
        .regex(stateRegex, "State must only contain letters and spaces"),
    country: z
        .string()
        .min(2, "Country must be at least 2 characters")
        .max(50, "Country cannot exceed 50 characters")
        .regex(countryRegex, "Country must only contain letters and spaces"),
    location: z.object({
        type: z.literal("Point"),
        coordinates: z
            .tuple([z.number(), z.number()])
            .refine((arr) => arr.length === 2, "Coordinates must be [lon, lat]"),
    }),
});

// S3 file key schema
export const s3FileKeySchema = z.object({
    s3FileKey: z.string().min(1).max(500, "key is too long"),
});