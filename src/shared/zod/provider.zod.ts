import { z } from "zod";
import { PlanName } from "../../domain/enums/plan.enum";
import {
    validateProviderIdSchema,
    paginationSchema,
    dateSchema,
    s3FileKeySchema,
} from "./base.zod";
import { ServiceMode, ServiceType } from "../../domain/enums/service.enum";
import { SubscriptionValidity } from "../../domain/enums/subscription.enum";
import { objectIdRegex, serviceDescriptionRegex, serviceExperienceRegex, serviceNameRegex, timeRegex } from "../utils/regex";

// Provider id with pagination validation schema
export const providerIdWithPaginationSchema = z.object({
    providerId: z.string().regex(objectIdRegex, "Invalid providerId").optional()
}).merge(paginationSchema);

// Provider add service details controller zod schema
export const serviceDetailsSchema = z.object({
    serviceName: z
        .string()
        .min(4, "Service name must be at least 4 characters")
        .max(50, "Service name cannot exceed 50 characters")
        .regex(
            serviceNameRegex,
            "Invalid service name. Only alphabets and spaces are allowed (4–50 characters)."
        ),

    serviceDescription: z
        .string()
        .min(10, "Service description must be at least 10 characters")
        .max(500, "Service description cannot exceed 500 characters")
        .regex(
            serviceDescriptionRegex,
            "Invalid service description. Only alphanumeric characters, spaces, and symbols are allowed (10–500 characters)."
        ),

    servicePrice: z.preprocess(
        (val) => {
            if (typeof val === "string" && val.trim() !== "") return Number(val);
            return val;
        },
        z
            .number()
            .min(1, "Service price must be at least 1")
            .max(1_000_000, "Service price cannot exceed 1,000,000")
    ),

    serviceExperience: z
        .string()
        .min(1, "Experience must be at least 1 character")
        .max(500, "Experience cannot exceed 500 characters")
        .regex(
            serviceExperienceRegex,
            "Invalid experience. Only alphanumeric characters, spaces, and symbols allowed (1–500 chars)."
        ),

    service: z
        .string()
        .min(1, "Service ID is required")
        .max(100, "Service ID cannot exceed 100 characters"),


    serviceType: z.nativeEnum(ServiceType),

    serviceMode: z.nativeEnum(ServiceMode),

    maxParticipants: z
        .number()
        .min(1, "At least 1 participant required")
        .max(500, "Cannot exceed 500 participants"),

    tags: z
        .array(z.string()),

    isGroupService: z.boolean(),

    requirements: z
        .string()
        .max(500, "Requirements cannot exceed 500 characters")
        .optional(),

    videoUrl: z.union([
    z.string().url("Invalid video URL"),
    z.literal(""),
  ]).optional(),
});

// Provider create service details validation schema
export const providerCreateServiceDetailsSchema = serviceDetailsSchema.merge(validateProviderIdSchema);

// Provider update service details validation schema
export const providerUpdateServiceDetailsSchema = z.object({
    serviceId: z.string().regex(objectIdRegex, "Invalid serviceId"),
}).merge(serviceDetailsSchema);

// Provider plan subscription duration validation
export const providerPlanSubscribeSchema = z.object({
    planId: z.string().regex(objectIdRegex, "Invalid planId"),
    planDuration: z.nativeEnum(SubscriptionValidity),
}).merge(validateProviderIdSchema);


// Provider dashboard validation schema
export const providerValidateDashboardDataSchema = z.object({
    subscription: z.nativeEnum(PlanName).default(PlanName.TRIAL),
    endDate: dateSchema.optional(),
    startDate: dateSchema.optional(),
});

// Provider update file validation schema
export const providerValidateUpdateFileSchema = s3FileKeySchema;