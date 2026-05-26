import { z } from "zod";
import { dateSchema } from "./base.zod";
import { FileType } from "../../domain/enums/common.enum";

// s3 presigned URL generation validation schema
export const presignedUrlSchema = z.object({
  folderName: z.string().min(1).max(50, "Folder name too long"),
  fileName: z.string().min(1).max(150, "File name too long"),
  fileType: z.nativeEnum(FileType),
});

// change block status validation schema
export const changeBlockStatusSchema = z.object({
  blockStatus: z.boolean(),
});

// start and end date validation schema
export const startAndEndDateSchema = z.object({
    startDate: dateSchema,
    endDate: dateSchema,
});