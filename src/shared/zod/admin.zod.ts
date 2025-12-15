import { z } from "zod";
import { serviceCategoryArray } from "../utils/constants";
import { verificationRejectionReasonRegex } from "./regex";
import { booleanField, numberField, stringField } from "./common.zod";

// **** admin provider controller **** \\
// Admin provider block status change controller zod validation
export const AdminChangeProviderStatusZodSchema = z.object({
    blockStatus: booleanField("Provider isBlocked"),
});

// Admin provider trust tag change controller zod validation
export const AdminChangeProviderTrustedTagZodSchema = z.object({
    trustTag: booleanField("Provider trusted by slotflow"),
});

// Admin reject provider with reason 
export const adminRejectProviderZodSchema = z.object({
    verificationRejectionReason: z.string().min(5).max(500).regex(verificationRejectionReasonRegex),
});





// **** admin user controller **** \\
// Admin user change block status controller zod validation
export const AdminChangeUserBlockStatusZOdSchema = z.object({
    blockStatus: booleanField("User isBlocked")
})





// **** admin service controller **** \\
// Admin adding new app service name controller zod validation
export const AdminAddServiceXZodSchema = z.object({
    serviceName: stringField("Service name", 4, 50, /^[A-Za-z0-9 ]{4,50}$/, "Service name can only contain letters, numbers, and spaces"),
    serviceCategory: z.enum(serviceCategoryArray),
});

// Admin change app service block status controller zod validation
export const AdminChangeServiceBlockStatusZodSchema = z.object({
    blockStatus: booleanField("Service iBlocked"),
});









// **** admin plan controller **** \\
//Admin add new plan controller zod validation
export const AdminAddNewPlanZodSchema = z.object({
    planName: stringField("PlanName",4,20,/^[a-zA-Z ]{4,20}$/,"Invalid plan name. Only alphabets and spaces are allowed, length between 4 and 20."),
    description: stringField("Plan description",10,200,/^[\w\d\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{10,200}$/,"Invalid description. Contains unsupported characters."),
    price: numberField("Plan price",0,100000),
    features: z.array(
    stringField("Feature", 1, 100)
  )
  .min(1, "At least one feature is required")
  .max(10, "Maximum 10 features allowed"),
    maxBookingPerMonth: numberField("Plan maximum booking",0,10000),
    adVisibility: booleanField("Plan adVisibility"),
});

// Admin change plan block status controller zod validation
export const AdminChangePlanIsBlockStatusZodSchema = z.object({
    blockStatus: booleanField("Plan isBlocked")
});