import { z } from "zod";
import { validateUserIdSchema } from "./user.zod";
import { validateProviderIdSchema } from "./provider.zod";
import { PlanName } from "../../domain/enums/planName.enum";
import { ServiceCategory } from "../../domain/enums/serviceCategories.enum";
import { changeBlockStatusSchema, dateSchema, paginationSchema, roleValidationSchema } from "./common.zod";
import { descriptionRegex, objectIdRegex, serviceNameRegex, verificationRejectionReasonRegex } from "../utils/regex";

//Admin add new plan controller zod validation
export const adminCreateNewPlanSchema = z.object({
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

//
export const validateReviewIdSchema = z.object({
    reviewId: z.string().regex(objectIdRegex, "Invalid reviewId"),
});

// Admin change user block status
export const adminUserBlockStatusSchema = validateUserIdSchema.merge(changeBlockStatusSchema);

// 
export const adminGetSubscriptionDetailsSchema = z.object({
    subscriptionId: z.string().regex(objectIdRegex, "Invalid subscriptionId"),
});

// Admin adding new app service controller zod validation
export const adminCreateNewServiceSchema = z.object({
    serviceName: z.string().min(4).max(50).regex(serviceNameRegex, "Invalid service name"),
    serviceCategory: z.nativeEnum(ServiceCategory),
});

// 
export const adminChangeServiceBlockStatusSchema = z.object({
    serviceId: z.string().regex(objectIdRegex, "Invalid serviceId"),
}).merge(changeBlockStatusSchema);

//
export const adminChangeReviewBlockStatusSchema = validateReviewIdSchema.merge(changeBlockStatusSchema);

//
export const adminChangeProviderBlockStatusSchema = validateProviderIdSchema.merge(changeBlockStatusSchema);

//
export const adminChangeProviderTrustTagSchema = z.object({
    trustTag: z.boolean(),
}).merge(validateProviderIdSchema);

// Admin reject provider with reason 
export const adminRejectProviderSchema = z.object({
    verificationRejectionReason: z.string().min(5).max(500).regex(verificationRejectionReasonRegex),
    isAddressVerified: z.boolean(),
    isServiceDetailsVerified: z.boolean(),
    isAvailabilityVerified: z.boolean(),
    isProofsVerified: z.boolean(),
}).merge(validateProviderIdSchema);

//
export const adminChangePlanBlockStatusSchema = z.object({
    planId: z.string().regex(objectIdRegex, "Invalid planId"),
}).merge(changeBlockStatusSchema);

//
export const adminFetchRevenuewReposrtSchema = z.object({
    startDate: dateSchema, 
    endDate: dateSchema
}).merge(paginationSchema);

//
export const adminFetchAllReviewsSchema = z.object({
    userId: z.string().regex(objectIdRegex, "Invalid planId").optional(),
    providerId: z.string().regex(objectIdRegex, "Invalid planId").optional(),
}).merge(roleValidationSchema).merge(paginationSchema);
