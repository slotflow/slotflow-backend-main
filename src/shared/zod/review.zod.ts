import z from "zod";
import { objectIdRegex } from "../utils/regex";
import { paginationSchema } from "./base.zod";

export const getReviewsSchema = z.object({
  userId: z.string().regex(objectIdRegex, "Invalid userId").optional(),
  providerId: z.string().regex(objectIdRegex, "Invalid providerId").optional(),
}).merge(paginationSchema);

export const createReviewSchema = z.object({
    reviewText: z.string().min(5).max(1000),
    rating: z.number().min(1).max(5),
    providerId: z.string().regex(objectIdRegex, "Invalid providerId"),
    bookingId: z.string().regex(objectIdRegex, "Invalid bookingId"),
});

export const deleteReviewSchema = z.object({
    reviewId: z.string().regex(objectIdRegex, "Invalid reviewId"),
});

export const reportReviewSchema = z.object({
    reviewId: z.string().regex(objectIdRegex, "Invalid reviewId"),
});

export const toggleReviewBlockStatusSchema = z.object({
    reviewId: z.string().regex(objectIdRegex, "Invalid reviewId"),
    blockStatus: z.boolean(),
});