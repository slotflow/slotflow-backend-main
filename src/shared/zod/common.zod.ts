import { z } from "zod";
import { Role } from "../../domain/enums/role.enum";
import { Boolean, FileType } from "../../domain/enums/common.enum";
import { ServiceCategory } from "../../domain/enums/serviceCategories.enum";
import { addressLineRegex, cityRegex, countryRegex, districtRegex, landMarkRegex, objectIdRegex, phoneRegex, pincodeRegex, placeRegex, sessionIdRegex, stateRegex, usernameRegex } from "../utils/regex";
import { validateProviderIdSchema } from "./provider.zod";

// 
export const roleValidationSchema = z.object({
  role: z.nativeEnum(Role),
});

// Pagination zod schema with default values
export const paginationSchema = z.object({
  page: z.coerce.number().min(1, "Page must be at least 1").max(100, "Page must be at most 100").optional().default(1),
  limit: z.coerce.number().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").optional().default(10),
});

// Date validation schema for request query parameters
export const dateSchema = z.preprocess(
  (val) => {
    if (typeof val === "string" || val instanceof String) {
      const parsed = new Date(val as string);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return val;
  },
  z.date({
    required_error: "Date is required",
    invalid_type_error: "Date must be a valid Date object",
  })
);

// Address creation validation schema for users and providers
export const addressSchema = z.object({

  addressLine: z
    .string()
    .min(10, "Address line must be at least 10 characters")
    .max(150, "Address line cannot exceed 150 characters")
    .regex(
      addressLineRegex,
      "Address line must be 10–150 characters long and can include letters, numbers, spaces, and . , # -"
    ),

  landMark: z
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

// User or provider information update validation schema
export const updateInfoSchema = z.object({
  username: z.string().min(4).max(30).regex(usernameRegex, "Invalid username"),
  phone: z.string().min(4).max(30).regex(phoneRegex, "Invalid phone number")
});

// Stripe payment session validation schema
export const saveStripePaymentSchema = z.object({
  sessionId: z.string().min(5).max(200).regex(sessionIdRegex, "Invalid session Id"),
});

// Booking request query validation schema with filters
export const fetchBookingCommonSchema = z.object({
  online: z.nativeEnum(Boolean).optional(),
  raw: z.nativeEnum(Boolean).optional(),
}).merge(paginationSchema);

// Join or leave room validation schema
export const JoinOrLeftRoomSchema = z.object({
  joined: z.boolean(),
  joinedTime: z.string().optional(),
  leftCallTime: z.string().optional(),
}).merge(roleValidationSchema);

// S3 presigned URL generation validation schema
export const presignedUrlSchema = z.object({
  folderName: z.string().min(1).max(50, "Folder name too long"),
  fileName: z.string().min(1).max(150, "File name too long"),
  fileType: z.nativeEnum(FileType),
});

// S3 file key validation schema
export const s3FileKeySchema = z.object({
  s3FileKey: z.string().min(1).max(500, "key is too long"),
});

// File deletion validation schema
export const deleteFileSchema = z.object({
  folder: z.string().min(1).max(50, "Folername too long"),
});

// Fetch all app services validation schema
export const fetchAllAppServicesSchema = z.object({
  categories: z.nativeEnum(ServiceCategory).array(),
});

// Change block status validation schema
export const changeBlockStatusSchema = z.object({
  blockStatus: z.boolean(),
});

// Room ID validation schema
export const validateRoomIdSchema = z.object({
  roomId: z.string(),
});

//
export const validateBookingIdSchema = z.object({
  bookingId: z.string().regex(objectIdRegex, "Invalid bookingId")
});

//
export const fetchProviderServiceAvailabilitySchema = z.object({
    date: dateSchema,
}).merge(validateProviderIdSchema);

//
export const validateSubscriptionIdSchema = z.object({
  subscriptionId: z.string().regex(objectIdRegex, "Invalid subscriptionId")
});

//
export const validateJoinRoomSchema = JoinOrLeftRoomSchema.merge(validateRoomIdSchema);

//
export const validateReviewIdSchema = z.object({
  reviewId: z.string().regex(objectIdRegex, "Invalid bookingId")
});