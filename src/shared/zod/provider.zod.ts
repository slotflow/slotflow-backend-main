import { z } from "zod";
import { Day } from "../../domain/enums/day.enum";
import { PlanName } from "../../domain/enums/planName.enum";
import { ServiceType } from "../../domain/enums/serviceType.enum";
import { ServiceMode } from "../../domain/enums/serviceMode.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { SubscriptionValidity } from "../../domain/enums/subscriptionValidity.enum";
import { objectIdRegex, serviceDescriptionRegex, serviceExperienceRegex, serviceNameRegex, timeRegex } from "../utils/regex";
import { addressSchema, dateSchema, fetchBookingCommonSchema, JoinOrLeftRoomSchema, paginationSchema, s3FileKeySchema, saveStripePaymentSchema, updateInfoSchema, validateBookingIdSchema, validateRoomIdSchema } from "./common.zod";
import { validateReviewIdSchema } from "./admin.zod";

//
export const validateProviderIdSchema = z.object({
    providerId: z.string().regex(objectIdRegex, "Invalid userId"),
});

//
export const providerIdWithPaginationSchema = validateProviderIdSchema.merge(paginationSchema);

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
            .number({
                required_error: "Service price is required",
                invalid_type_error: "Service price must be a valid number",
            })
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

    videoUrl: z
        .string()
        .url("Invalid video URL")
        .optional(),
});

//
export const providerCreateServiceDetailsSchema = serviceDetailsSchema.merge(validateProviderIdSchema);

//
export const providerUpdateServiceDetailsSchema = z.object({
    serviceId: z.string().regex(objectIdRegex, "Invalid serviceId"),
}).merge(serviceDetailsSchema);

// Provider add service availability
export const providerCreateServiceAvailabilitySchema = z.array(
    z.object({
        day: z.nativeEnum(Day),
        duration: z.number().min(10).max(480),
        startTime: z.string().regex(timeRegex,"Invalid start time"),
        endTime: z.string().regex(timeRegex,"Invalid end time"),
        modes: z.array(z.nativeEnum(ServiceMode)).min(1),
        slots: z.array(z.string().min(1).max(30).regex(timeRegex,"Invalid slot time")),
    })
);

// Provider plan subscription duration validation
export const providerPlanSubscribeSchema = z.object({
    planId: z.string().regex(objectIdRegex, "Invalid planId"),
    planDuration: z.nativeEnum(SubscriptionValidity),
}).merge(validateProviderIdSchema);

//
export const providerSaveSubscriptionSchema = saveStripePaymentSchema.merge(validateProviderIdSchema)

// Validating the page and limit in the request query zod schema
export const providerChangeAppointmentStatusSchema = z.object({
    appointmentStatus: z.nativeEnum(AppointmentStatus),
}).merge(validateBookingIdSchema)

//
export const providerCreateAddressSchema = addressSchema.merge(validateProviderIdSchema);

//
export const providerUpdateAddressSchema = z.object({
    addressId: z.string().regex(objectIdRegex, "Invalid addressId"),
}).merge(addressSchema).merge(validateProviderIdSchema);

//
export const providerFetchAllAppointmentsSchema = fetchBookingCommonSchema.merge(validateProviderIdSchema);

//
export const providerValidateRoomSchema = validateBookingIdSchema.merge(validateRoomIdSchema).merge(validateProviderIdSchema);

//
export const providerValidateDashboardDataSchema = z.object({
    subscription: z.nativeEnum(PlanName).default(PlanName.Trial),
    endDate: dateSchema.optional(),
    startDate: dateSchema.optional(),
}).merge(validateProviderIdSchema);

//
export const providerValidateUpdateFileSchema = s3FileKeySchema.merge(validateProviderIdSchema);

//
export const providerValidateUpdateInfoSchema = validateProviderIdSchema.merge(updateInfoSchema);

//
export const providerChnageReviewReportSchema = validateReviewIdSchema.merge(validateProviderIdSchema);