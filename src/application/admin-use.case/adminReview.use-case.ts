import { Types } from "mongoose";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { Validator } from "../../infrastructure/validator/validator";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";

export class AdminUpdateReviewBlockStatusUseCase {
    constructor(
        private reviewRepositoryImpl: ReviewRepositoryImpl,
    ) { }

    async execute(reviewId: Types.ObjectId): Promise<ApiResponse> {

        if(!reviewId) throw new Error("Invalid request");
        Validator.validateObjectId(reviewId, "Review ID");

        const review = await this.reviewRepositoryImpl.findReviewById(reviewId);
        if(!review) throw new Error("No review found");

        review.isBlocked = !review.isBlocked

        const updatedReview = await this.reviewRepositoryImpl.updateReview(review);
        if(!updatedReview) throw new Error("Review block status updating failed");

        return { success: true, message: "Review block status updated" };
    }
}