import { ReviewProps } from "../contracts/review.contract";

export type CreateReviewDProps = Omit<ReviewProps, "_id" | "createdAt" | "updatedAt">;

export type UpdateReviewProps = Omit<ReviewProps, "_id" | "createdAt" | "updatedAt">;