import { Types } from "mongoose";
import { Review } from "../../entities/review.entity";
import { CreateReviewRequset } from "../../../application/dtos/user.dto";
import { ApiResponse, FetchReviesRequest, FetchReviewsResponse } from "../../../application/dtos/common.dto";

export interface IReviewRepository {

    createReview(data: CreateReviewRequset): Promise<Review | null>;

    findAllReviews(data: FetchReviesRequest) : Promise<ApiResponse<FetchReviewsResponse[]>>;

    deleteReview(reviewId: Types.ObjectId): Promise<boolean>;

    findReviewById(reviewId: Types.ObjectId): Promise<Review | null>;

    updateReview(review: Review): Promise<Review | null>;

}