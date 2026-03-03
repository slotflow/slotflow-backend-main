import z from "zod";
import { objectIdRegex } from "../utils/regex";
import { Boolean } from "../../domain/enums/common.enum";
import { ServiceMode } from "../../domain/enums/service.enum";
import { dateSchema, paginationSchema, validateProviderIdSchema, validateUserIdSchema } from "./base.zod";

export const validateBookingIdSchema = z.object({
    bookingId: z.string().regex(objectIdRegex, "Invalid bookingId"),
});

export const getBookingsSchema = z.object({
  online: z.nativeEnum(Boolean).optional(),
}).merge(paginationSchema);

export const validateRoomIdSchema = z.object({
  roomId: z.string().min(1).max(50),
  bookingId: z.string().regex(objectIdRegex, "Invalid bookingId")
});

export const bookingCheckoutViaStripeSchema = z.object({
    slotId: z.string().regex(objectIdRegex, "Invalid slot id"),
    date: dateSchema,
    selectedServiceMode: z.nativeEnum(ServiceMode),
}).merge(validateUserIdSchema).merge(validateProviderIdSchema);

export const cancelBookingSchema = validateBookingIdSchema.merge(validateUserIdSchema);
