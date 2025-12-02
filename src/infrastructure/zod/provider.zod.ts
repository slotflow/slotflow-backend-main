import { z } from "zod";
import { objectIdField } from "./common.zod";
import { serviceDescriptionRegex, serviceExperienceRegex, serviceNameRegex } from "./regex";
import { appointmentStatusArray, daysArray, serviceModeArray, serviceTypeArray, subscriptionMonthArray } from "../../utils/constants";


// **** Provider Service Controller **** \\
// Provider add service details controller zod schema
export const ProviderCreateServiceDetailsZodSchema = z.object({
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

    serviceCategory: z
        .string()
        .min(1, "Service Category ID is required")
        .max(100, "Service Category ID cannot exceed 100 characters"),


    serviceType: z.enum(serviceTypeArray),

    serviceMode: z.enum(serviceModeArray),

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





// **** Provider service availability controller **** \\
// Provider add service availability
export const ProviderCreateServiceAvailabilityZodSchema = z.array(
    z.object({
        day: z.enum(daysArray),
        duration: z.number().min(10).max(480),
        startTime: z.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/),
        endTime: z.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/),
        modes: z.array(z.enum(serviceModeArray)).min(1),
        slots: z.array(z.string().min(1).max(30).regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)),
    })
)





// **** Provider Subscription Controller **** \\
// Provider plan subscription duration validation
export const ProviderPlanSubscribeZodSchema = z.object({
    planId: objectIdField("Plan ID"),
    planDuration: z.enum(subscriptionMonthArray),
});



// **** Provider Booking Controller **** \\
// Validating the page and limit in the request query zod schema
export const ProviderChangeBookingAppointmentStatusZodSchema = z.object({
    appointmentStatus: z.enum(appointmentStatusArray)
});



