import { Types } from "mongoose";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { Validator } from "../../infrastructure/validator/validator";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";

export class ProviderReportReviewUseCase {
    constructor(
        private reviewRepositoryImpl: ReviewRepositoryImpl,
    ) { }

    async execute(reviewId: Types.ObjectId, providerId: Types.ObjectId): Promise<ApiResponse> {

        if(!reviewId || !providerId) throw new Error("Invalid request");
        Validator.validateObjectId(reviewId, "Review Id");
        Validator.validateObjectId(providerId, "Provider Id");

        const review = await this.reviewRepositoryImpl.findReviewById(reviewId);
        if(!review) throw new Error("No review found");

        if(review.providerId.toString() !== providerId.toString()) throw new Error("You are not permitted to report this review");

        review.reported = true;

        const updatedReview = await this.reviewRepositoryImpl.updateReview(review);
        if(!updatedReview) throw new Error("Review reporting failed");

        return { success: true, message: "Review reported" };
    }
}