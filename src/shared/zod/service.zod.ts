import z from "zod";
import { paginationSchema } from "./base.zod";
import { objectIdRegex, serviceNameRegex } from "../utils/regex";
import { ServiceCategory } from "../../domain/enums/service.enum";

// ServiceId validation schemas
export const validateServiceSchema = z.object({
  serviceId: z.string().regex(objectIdRegex, "Invalid serviceId"),
});

// Admin adding new app service controller zod validation
export const adminCreateServiceSchema = z.object({
  serviceCategory: z.nativeEnum(ServiceCategory),
  serviceNames: z
    .array(
      z
        .string()
        .trim()
        .min(4)
        .max(50)
        .regex(serviceNameRegex, "Invalid service name")
    )
    .min(1, "At least one service name is required")
    .refine(
      (names) => new Set(names.map((name) => name.toLowerCase())).size === names.length,
      "Duplicate service names are not allowed"
    ),
});

// Admin updating app service controller zod validation
export const adminUpdateServiceSchema = z.object({
  serviceCategory: z.nativeEnum(ServiceCategory),
  serviceName: z
    .string()
    .trim()
    .min(4)
    .max(50)
    .regex(serviceNameRegex, "Invalid service name"),
    isBlocked: z.boolean()
}).merge(validateServiceSchema);

// Get services schema
export const getServicesSchema = z.object({
  serviceCategory: z.nativeEnum(ServiceCategory).array().optional(),
}).merge(paginationSchema);

// Admin change service block status
export const adminChangeServiceBlockStatusSchema = z.object({
  isBlocked: z.boolean(),
}).merge(validateServiceSchema);