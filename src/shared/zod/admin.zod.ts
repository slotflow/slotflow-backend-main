import { z } from "zod";
import { verificationRejectionReasonRegex } from "./regex";
import { PlanName } from "../../domain/enums/planName.enum";
import { booleanField, numberField, stringField } from "./common.zod";
import { ServiceCategory } from "../../domain/enums/serviceCategories.enum";

// **** admin provider controller **** \\
// Admin provider trust tag change controller zod validation
export const AdminChangeProviderTrustedTagZodSchema = z.object({
    trustTag: booleanField("Provider trusted by slotflow"),
});

// Admin reject provider with reason 
export const adminRejectProviderZodSchema = z.object({
    verificationRejectionReason: z.string().min(5).max(500).regex(verificationRejectionReasonRegex),
    isAddressVerified: z.boolean(),
    isServiceDetailsVerified: z.boolean(),
    isAvailabilityVerified: z.boolean(),
    isProofsVerified: z.boolean(),
});






// **** admin service controller **** \\
// Admin adding new app service name controller zod validation
export const AdminAddServiceXZodSchema = z.object({
    serviceName: stringField("Service name", 4, 50, /^[A-Za-z0-9 ]{4,50}$/, "Service name can only contain letters, numbers, and spaces"),
    serviceCategory: z.nativeEnum(ServiceCategory),
});







// **** admin plan controller **** \\
//Admin add new plan controller zod validation
export const AdminAddNewPlanZodSchema = z.object({
    planName: z.nativeEnum(PlanName),
    description: stringField("Plan description", 10, 200, /^[\w\d\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{10,200}$/, "Invalid description. Contains unsupported characters."),
    price: numberField("Plan price", 0, 100000),
    features: z.array(
        stringField("Feature", 1, 100)
    )
        .min(1, "At least one feature is required")
        .max(10, "Maximum 10 features allowed"),
    maxBookingPerMonth: numberField("Plan maximum booking", 0, 10000),
    adVisibility: booleanField("Plan adVisibility"),
});
