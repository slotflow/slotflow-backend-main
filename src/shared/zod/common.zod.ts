import { z } from "zod";
import { FileType } from "../../domain/enums/common.enum";
import { ServiceCategory } from "../../domain/enums/service.enum";

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

// Start and end date validation schema
export const startAndEndDateSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
});