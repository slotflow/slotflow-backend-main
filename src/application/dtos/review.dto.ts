import { ApiPaginationInput } from "./common.dto";
import { Role } from "../../domain/enums/common.enum";
import { Review } from "../../domain/entities/review.entity";
import { UserProps } from "../../domain/contracts/user.contract";
import { ReviewProps } from "../../domain/contracts/review.contract";

/**
 * Review queries dtos
 */

// findAll method
interface GetReviewsFilter {
  userId?: UserProps["_id"];
  providerId?: UserProps["_id"];
  role?: Role;
}
export interface GetReviewsQuery extends ApiPaginationInput, GetReviewsFilter {}
export interface GetReviewsView extends Pick<
  ReviewProps,
  "_id" | "createdAt" | "reviewText" | "rating" | "reported" | "isBlocked"
> {
  userId: Pick<UserProps, "username" | "profileImage">;
  providerId: Pick<UserProps, "username" | "profileImage">;
}

/**
 * Review usecase dtos
 */

// GetReviews
export type GetReviewsInput = GetReviewsQuery;
export type GetReviewsOutput = Array<GetReviewsView>;

// RepostReview
export interface ReportReviewInput {
  reviewId: Review["_id"];
  providerId: UserProps["_id"];
  reported: ReviewProps["reported"];
}
export type ReportReviewOutput = Pick<ReviewProps, "_id" | "reported">;

// CreateReview
export type CreateReviewInput = Pick<
  ReviewProps,
  "reviewText" | "rating" | "userId" | "providerId" | "bookingId"
>;

// UserDeleteReview
export interface UserDeleteReviewInput {
  reviewId: Review["_id"];
  userId: UserProps["_id"];
}
