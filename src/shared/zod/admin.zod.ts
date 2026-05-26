import { z } from "zod";
import { changeBlockStatusSchema } from "./common.zod";
import { ServiceCategory } from "../../domain/enums/service.enum";
import { validateUserIdSchema, validateProviderIdSchema } from "./base.zod";
import { objectIdRegex, serviceNameRegex, verificationRejectionReasonRegex } from "../utils/regex";

// Admin change user block status
export const adminUserBlockStatusSchema = validateUserIdSchema.merge(changeBlockStatusSchema);

// Admin adding new app service controller zod validation
export const adminCreateNewServiceSchema = z.object({
    serviceName: z.string().min(4).max(50).regex(serviceNameRegex, "Invalid service name"),
    serviceCategory: z.nativeEnum(ServiceCategory),
});

// Admin change service block status
export const adminChangeServiceBlockStatusSchema = z.object({
    serviceId: z.string().regex(objectIdRegex, "Invalid serviceId"),
}).merge(changeBlockStatusSchema);

// Admin change provider block status
export const adminChangeProviderBlockStatusSchema = validateProviderIdSchema.merge(changeBlockStatusSchema);

// Admin change provider trust tag
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