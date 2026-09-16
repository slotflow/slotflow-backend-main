import z from "zod";
import { PlanName } from "../../domain/enums/plan.enum";
import { descriptionRegex, objectIdRegex } from "../utils/regex";

// Plan id validation schemas
export const validatePlanIdSchema = z.object({
    planId: z.string().regex(objectIdRegex, "Invalid planId"),
});

// Create plan schema
export const createPlanSchema = z.object({
    planName: z.nativeEnum(PlanName),
    description: z.string()
        .min(10, "Plan description must be at least 10 characters")
        .max(200, "Plan description must be at most 200 characters")
        .regex(descriptionRegex, "Invalid description. Contains unsupported characters."),
    monthlyPrice: z.number()
        .min(0, "Plan monthly price must be at least 0")
        .max(100000, "Plan mothly price must be at most 100000"),
    yearlyPrice: z.number()
        .min(0, "Plan yearly price must be at least 0")
        .max(100000, "Plan yearly price must be at most 100000"),
    features: z.array(z.string()
        .min(1, "Feature must be at least 1 character")
        .max(100, "Feature must be at most 100 characters"))
        .min(1, "At least one feature is required")
        .max(15, "Maximum 10 features allowed"),
    maxBookingPerMonth: z.number()
        .min(0, "Plan maximum booking must be at least 0")
        .max(10000, "Plan maximum booking must be at most 10000"),
    adVisibility: z.coerce.boolean(),
    hasTrial: z.boolean().default(false),
    trialDays: z
        .number()
        .min(0, 'Trial days cannot be negative')
        .max(30, 'Trial days cannot exceed 30')
        .default(0),
});

// Change plan block status schema
export const changePlanBlockStatusSchema = z.object({
    planId: z.string().regex(objectIdRegex, "Invalid planId"),
    isBlocked: z.boolean()
});

export const updatePlanSchema = createPlanSchema.partial();