import { ReviewProps } from "../contracts/review.contract";

export type CreateReviewDProps = Omit<ReviewProps, "_id" | "createdAt" | "updatedAt" | "isBlocked" | "reported">;

export type UpdateReviewProps = Omit<ReviewProps, "_id" | "createdAt" | "updatedAt">;