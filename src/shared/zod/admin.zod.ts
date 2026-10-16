import { z } from "zod";
import { verificationRejectionReasonRegex } from "../utils/constants/regex";
import { changeBlockStatusSchema, startAndEndDateSchema } from "./common.zod";
import { validateUserIdSchema, validateProviderIdSchema, roleValidationSchema } from "./base.zod";

// Admin change user block status
export const adminUserBlockStatusSchema = validateUserIdSchema.merge(changeBlockStatusSchema);

// Admin change provider block status
export const adminChangeProviderBlockStatusSchema =
  validateProviderIdSchema.merge(changeBlockStatusSchema);

// Admin change provider trust tag
export const adminChangeProviderTrustTagSchema = z
  .object({
    trustTag: z.boolean(),
  })
  .merge(validateProviderIdSchema);

// Admin reject provider with reason
export const adminRejectProviderSchema = z
  .object({
    verificationRejectionReason: z.string().min(5).max(500).regex(verificationRejectionReasonRegex),
    isAddressVerified: z.boolean(),
    isServiceDetailsVerified: z.boolean(),
    isAvailabilityVerified: z.boolean(),
    isProofsVerified: z.boolean(),
  })
  .merge(validateProviderIdSchema);

// Admin get role based chart data
export const adminGetRoleBasedChartData = roleValidationSchema.merge(startAndEndDateSchema);
