import z from "zod";
import { ServiceCategory } from "../../domain/enums/service.enum";
import { paginationSchema } from "./base.zod";

export const getServicesSchema = z.object({
  serviceCategory: z.nativeEnum(ServiceCategory).array().optional(),
}).merge(paginationSchema);