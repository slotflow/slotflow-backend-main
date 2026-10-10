import z from "zod";
import { timeRegex } from "../utils/constants/regex";
import { Day } from "../../domain/enums/common.enum";
import { ServiceMode } from "../../domain/enums/service.enum";
import { dateOnlySchema, validateProviderIdSchema } from "./base.zod";
import { parseTimeToMinutes } from "../utils/helpers/parseTimeToMinutes";

// Create service availability schema
export const createServiceAvailabilitySchema = z.array(
  z
    .object({
      day: z.enum(Day),
      isAvailable: z.boolean(),
      duration: z.number().optional(),
      startTime: z.string().regex(timeRegex, "Invalid start time").optional(),
      endTime: z.string().regex(timeRegex, "Invalid end time").optional(),
      modes: z.array(z.enum(ServiceMode)).optional(),
      slots: z.array(z.string().min(1).max(30).regex(timeRegex, "Invalid slot time")).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.isAvailable) {
        if (!data.duration || data.duration < 10) {
          ctx.addIssue({
            path: ["duration"],
            code: z.ZodIssueCode.custom,
            message: "Duration must be at least 10 minutes",
          });
        }

        if (!data.modes || data.modes.length === 0) {
          ctx.addIssue({
            path: ["modes"],
            code: z.ZodIssueCode.custom,
            message: "At least one mode is required",
          });
        }

        if (!data.slots || data.slots.length === 0) {
          ctx.addIssue({
            path: ["slots"],
            code: z.ZodIssueCode.custom,
            message: "At least one slot is required",
          });
        }

        if (!data.startTime) {
          ctx.addIssue({
            path: ["startTime"],
            code: z.ZodIssueCode.custom,
            message: "Start time is required",
          });
        }

        if (!data.endTime) {
          ctx.addIssue({
            path: ["endTime"],
            code: z.ZodIssueCode.custom,
            message: "End time is required",
          });
        }

        if (data.startTime && data.endTime) {
          const startMin = parseTimeToMinutes(data.startTime);
          const endMin = parseTimeToMinutes(data.endTime);

          if (startMin !== null && endMin !== null && startMin >= endMin) {
            ctx.addIssue({
              path: ["endTime"],
              code: z.ZodIssueCode.custom,
              message: "End time must be after start time",
            });
          }
        }
      }
    }),
);

// Get service availability schema
export const getServiceAvailabilitySchema = z
  .object({
    date: dateOnlySchema,
  })
  .merge(validateProviderIdSchema);
