import z from "zod";
import { changeBlockStatusSchema } from "./common.zod";
import { PlanName } from "../../domain/enums/plan.enum";
import { descriptionRegex, objectIdRegex } from "../utils/regex";

// Create plan schema
export const createPlanSchema = z.object({
    planName: z.nativeEnum(PlanName),
    description: z.string()
        .min(10, "Plan description must be at least 10 characters")
        .max(200, "Plan description must be at most 200 characters")
        .regex(descriptionRegex, "Invalid description. Contains unsupported characters."),
    price: z.number()
        .min(0, "Plan price must be at least 0")
        .max(100000, "Plan price must be at most 100000"),
    features: z.array(z.string()
        .min(1, "Feature must be at least 1 character")
        .max(100, "Feature must be at most 100 characters"))
        .min(1, "At least one feature is required")
        .max(10, "Maximum 10 features allowed"),
    maxBookingPerMonth: z.number()
        .min(0, "Plan maximum booking must be at least 0")
        .max(10000, "Plan maximum booking must be at most 10000"),
    adVisibility: z.coerce.boolean(),
});

// Change plan block status schema
export const changePlanBlockStatusSchema = z.object({
    planId: z.string().regex(objectIdRegex, "Invalid planId"),
}).merge(changeBlockStatusSchema);