import { Review } from "../../domain/entities/review.entity";
import { Role } from "../../domain/enums/common.enum";
import { ApiPaginationInput, ReviewDTO, UserDTO } from "./common.dto";

//// **** reviews queries dtos **** ////

// 1. findAll method parameter and return
interface GetReviewsFilter {
  userId?: UserDTO["_id"];
  providerId?: UserDTO["_id"];
  role?: Role;
}
export interface GetReviewsQuery extends ApiPaginationInput, GetReviewsFilter { }
export interface GetReviewsView extends Pick<ReviewDTO, "_id" | "createdAt" | "reviewText" | "rating" | "reported" | "isBlocked"> {
  userId: Pick<UserDTO, "username" | "profileImage">;
  providerId: Pick<UserDTO, "username" | "profileImage">;
};










//// **** review usecase input output **** ////

// GetReviews usecase input output
export type GetReviewsInput = GetReviewsQuery
export type GetReviewsOutput = GetReviewsView

// RepostReview usecase input output
export interface RepostReviewInput {
  reviewId: Review["_id"];
  providerId: UserDTO["_id"];
}

// CreateReview usecase input output
export type CreateReviewInput = Pick<ReviewDTO, "reviewText" | "rating" | "userId" | "providerId" | "bookingId">;

// UserDeleteReview usecase input output
export interface UserDeleteReviewInput {
    reviewId: Review["_id"];
    userId: UserDTO["_id"];
}