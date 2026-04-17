import z from "zod";
import { timeRegex } from "../utils/regex";
import { Day } from "../../domain/enums/common.enum";
import { ServiceMode } from "../../domain/enums/service.enum";
import { dateSchema, validateProviderIdSchema } from "./base.zod";

// Create service availability schema
export const createServiceAvailabilitySchema = z.array(
    z.object({
        day: z.enum(Day),
        duration: z.number().min(10).max(480),
        startTime: z.string().regex(timeRegex, "Invalid start time"),
        endTime: z.string().regex(timeRegex, "Invalid end time"),
        modes: z.array(z.enum(ServiceMode)).min(1),
        slots: z.array(z.string().min(1).max(30).regex(timeRegex, "Invalid slot time")),
    })
);

// Get service availability schema
export const getServiceAvailabilitySchema = z.object({
  date: dateSchema,
}).merge(validateProviderIdSchema);