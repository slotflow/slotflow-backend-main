import z from "zod";
import { objectIdRegex } from "../utils/regex";
import { Boolean } from "../../domain/enums/common.enum";
import { ServiceMode } from "../../domain/enums/service.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { dateSchema, paginationSchema, validateProviderIdSchema } from "./base.zod";

// Booking validation schemas
export const validateBookingIdSchema = z.object({
  bookingId: z.string().regex(objectIdRegex, "Invalid bookingId"),
});

// Booking list validation schemas
export const getBookingsSchema = z.object({
  online: z.nativeEnum(Boolean).optional(),
}).merge(paginationSchema);

// Booking room validation schemas
export const validateRoomIdSchema = z.object({
  roomId: z.string().min(1).max(50),
  bookingId: z.string().regex(objectIdRegex, "Invalid bookingId")
});

// Booking checkout validation schemas
export const bookingCheckoutViaStripeSchema = z.object({
  slotId: z.string().regex(objectIdRegex, "Invalid slot id"),
  date: dateSchema,
  selectedServiceMode: z.nativeEnum(ServiceMode),
}).merge(validateProviderIdSchema);

// Booking cancel validation schemas
export const cancelBookingSchema = z.object({
  reason: z.string().min(10, "Too short reason").max(500, "Too long reason").optional(),
}).merge(validateBookingIdSchema);

// Booking join room validation schemas
export const validateJoinRoomSchema = z.object({
  roomId: z.string(),
  joined: z.boolean(),
  joinedTime: z.string().optional(),
  leftCallTime: z.string().optional(),
});

// Change booking status validation schemas
export const changeBookingStatusSchema = z.object({
    appointmentStatus: z.nativeEnum(AppointmentStatus),
}).merge(validateBookingIdSchema);