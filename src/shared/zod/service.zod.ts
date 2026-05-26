import z from "zod";
import { paginationSchema } from "./base.zod";
import { ServiceCategory } from "../../domain/enums/service.enum";

// Get services schema
export const getServicesSchema = z.object({
  serviceCategory: z.nativeEnum(ServiceCategory).array().optional(),
}).merge(paginationSchema);