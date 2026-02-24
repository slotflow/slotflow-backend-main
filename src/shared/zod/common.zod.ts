import {
  dateSchema,
  paginationSchema,
  roleValidationSchema,
  validateRoomIdSchema,
  validateProviderIdSchema,
} from "./base.zod";
import { z } from "zod";
import { ServiceCategory } from "../../domain/enums/service.enum";
import { Boolean, FileType } from "../../domain/enums/common.enum";
import { objectIdRegex } from "../utils/regex";

// Booking request query validation schema with filters
export const getBookingsSchema = z.object({
  online: z.nativeEnum(Boolean).optional(),
  providerId: z.string().regex(objectIdRegex,"Invalid providerId").optional(),
  userId: z.string().regex(objectIdRegex,"Invalid userId").optional(),
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

// File deletion validation schema
export const deleteFileSchema = z.object({
  folder: z.string().min(1).max(50, "Folername too long"),
});

// Fetch all app services validation schema
export const fetchAllAppServicesSchema = z.object({
  serviceCategory: z.nativeEnum(ServiceCategory).array(),
});

// Change block status validation schema
export const changeBlockStatusSchema = z.object({
  blockStatus: z.boolean(),
});

//
export const fetchProviderServiceAvailabilitySchema = z.object({
  date: dateSchema,
}).merge(validateProviderIdSchema);

//
export const validateJoinRoomSchema = JoinOrLeftRoomSchema.merge(validateRoomIdSchema);
