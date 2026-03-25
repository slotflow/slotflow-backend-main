import z from "zod";
import { Day } from "../../domain/enums/common.enum";
import { timeRegex } from "../utils/regex";
import { ServiceMode } from "../../domain/enums/service.enum";
import { dateSchema, validateProviderIdSchema } from "./base.zod";

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

export const fetchServiceAvailabilitySchema = z.object({
  date: dateSchema,
}).merge(validateProviderIdSchema);