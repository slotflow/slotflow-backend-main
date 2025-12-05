import { z } from "zod";
import { Types } from "mongoose";
import { roleArray } from "../utils/constants";
import { addressLineRegex, cityRegex, countryRegex, districtRegex, landMarkRegex, phoneRegex, pincodeRegex, placeRegex, stateRegex } from "./regex";

// ****** Common zod validations for reuse ****** \\

// Object Id zod validation
export const objectIdField = (fieldName = "ID") =>
  z.string({
    required_error: `${fieldName} is required`,
    invalid_type_error: `${fieldName} must be a string`,
  }).refine(id => Types.ObjectId.isValid(id), {
    message: `Invalid ${fieldName} format`,
  });

// Boolean field zod validation
export const booleanField = (fieldName = "Boolean") =>
  z.boolean().refine(val => typeof val === 'boolean', {
    message: `${fieldName} status must be boolean`,
  });

// String field zod validation
export const stringField = (
  fieldName = "Value",
  min?: number,
  max?: number,
  regex?: RegExp,
  regexMessage = "Invalid format"
) => {
  let schema = z.string({
    required_error: `${fieldName} is required`,
    invalid_type_error: `${fieldName} must be a string`,
  });

  if (min !== undefined) {
    schema = schema.min(min, `${fieldName} must be at least ${min} characters`);
  }

  if (max !== undefined) {
    schema = schema.max(max, `${fieldName} must be at most ${max} characters`);
  }

  if (regex !== undefined) {
    schema = schema.regex(regex, regexMessage);
  }

  return schema;
};

// Date common field
export const dateField = z.preprocess(
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

// Number field zod validation
export const numberField = (
  fieldName = "Value",
  min?: number,
  max?: number
) => {
  let schema = z.number({
    required_error: `${fieldName} is required`,
    invalid_type_error: `${fieldName} must be a number`
  });

  if (min !== undefined) {
    schema = schema.min(min, `${fieldName} must be at least ${min}`);
  }

  if (max !== undefined) {
    schema = schema.max(max, `${fieldName} must be at most ${max}`);
  }

  return schema;
};

// String enum field
export const enumField = (fieldName: string, values: readonly string[]) =>
  z.enum(values as [string, ...string[]], {
    required_error: `${fieldName} is required`,
    invalid_type_error: `${fieldName} must be one of: ${values.join(", ")}`,
  });

// String enum field
export const stringArrayField = (
  fieldName = "Value",
  arrayMin?: number,
  arrayMax?: number,
  itemMin?: number,
  itemMax?: number,
  regex?: RegExp,
  regexMessage = "Invalid format"
) => {
  let itemSchema = z.string({
    required_error: `${fieldName} item is required`,
    invalid_type_error: `${fieldName} item must be a string`,
  });

  if (itemMin !== undefined) {
    itemSchema = itemSchema.min(itemMin, `${fieldName} item must be at least ${itemMin} characters`);
  }

  if (itemMax !== undefined) {
    itemSchema = itemSchema.max(itemMax, `${fieldName} item must be at most ${itemMax} characters`);
  }

  if (regex !== undefined) {
    itemSchema = itemSchema.regex(regex, regexMessage);
  }

  let arraySchema = z.array(itemSchema);

  if (arrayMin !== undefined) {
    arraySchema = arraySchema.min(arrayMin, `At least ${arrayMin} ${fieldName.toLowerCase()}(s) required`);
  }

  if (arrayMax !== undefined) {
    arraySchema = arraySchema.max(arrayMax, `At most ${arrayMax} ${fieldName.toLowerCase()}(s) allowed`);
  }

  return arraySchema;
};










// **** Zod schema that is common for multiple controllers **** \\
// Date zod validation alone for the date coming in req.query
export const DateZodSchema = z.object({
  date: dateField,
});

// User and Provider addess adding controllerz zod validation
export const CreateAddressZodSchema = z.object({
  _id: z.string(),

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

// user or provider username and phone updation controller
export const UserOrProviderUpdateInfoZodSchema = z.object({
  username: stringField("Username", 4, 30, /^[a-zA-Z ]{4,30}$/, "Invalid username"),
  phone: stringField("Phone", 7, 20, /^\+?[0-9\s\-().]{7,20}$/, "Invalid phone number. Only digits, spaces, dashes (-), dots (.), parentheses (), and an optional + at the beginning are allowed. Length must be between 7 to 20 characters."),
});

// Stripe Payment Schema
export const SaveStripePaymentZodSchema = z.object({
  sessionId: stringField("Stripe session Id", 5, 200, /^cs_test_[a-zA-Z0-9]{5,200}$/, "Invalid session ID")
});

// Validating the page and limit in the request query zod schema
export const RequestQueryCommonZodSchema = z.object({
  page: stringField("Request query parameter page")
    .transform(Number)
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Page must be a valid positive number",
    }),

  limit: stringField("Request query parameter limit")
    .transform(Number)
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Limit must be a valid positive number",
    }),
});

// Validating the page and limit in the request query zod schema
export const RequestQueryForBookingCommonZodSchema = z.object({
  page: stringField("Request query parameter page")
    .transform(Number)
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Page must be a valid positive number",
    }),

  limit: stringField("Request query parameter limit")
    .transform(Number)
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Limit must be a valid positive number",
    }),

  online: enumField("online filter", ["true", "false"]).optional(),
  raw: enumField("raw filter", ["true", "false"]).optional(),
});

// ObjectId validation
export const ValidateObjectId = (id: string, name: string) => {
  const schema = z.object({
    id: objectIdField(name),
  });
  return schema.parse({ id });
};


export const JoinOrLeftRoomZodSchema = z.object({
  joined: booleanField("joined"),
  joinedTime: stringField("joinedTime").optional(),
  leftCallTime: stringField("leftCallTime").optional(),
  role: z.enum(roleArray),
})



export const RequestQueryFetchAllReviewsZodSchema = z.object({
  page: stringField("Request query parameter page")
    .transform(Number)
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Page must be a valid positive number",
    }),

  limit: stringField("Request query parameter limit")
    .transform(Number)
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Limit must be a valid positive number",
    }),
  role: z.enum(roleArray),
});



export const PresignedUrlZodSchema =z.object({
    folderName: z.string().min(1).max(50, "Folder name too long"),
    fileName: z.string().min(1).max(150, "File name too long"),
    fileType: z.enum([
      "image/png",
      "image/jpeg",
      "image/jpg"
    ]),
  });


export const s3FileKeyZodSchmema = z.object({
  s3FileKey: z.string().min(1).max(500, "key is too long"),
});

export const deleteFileZodSchema = z.object({
  folder: z.string().min(1).max(50, "Folername too long"),
});