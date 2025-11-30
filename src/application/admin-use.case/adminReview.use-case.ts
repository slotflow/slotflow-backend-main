import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { AdminUpdateReviewBlockStatusRequest } from "../../infrastructure/dtos/admin.dto";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";

export class AdminUpdateReviewBlockStatusUseCase {
    constructor(
        private reviewRepositoryImpl: ReviewRepositoryImpl,
    ) { }

    async execute(payload: AdminUpdateReviewBlockStatusRequest): Promise<ApiResponse> {
        try {
            const { reviewId } = payload;

            const review = await this.reviewRepositoryImpl.findReviewById(reviewId);
            if(!review) throw new Error("No review found");

            review.isBlocked = !review.isBlocked;

            const updatedReview = await this.reviewRepositoryImpl.updateReview(review);
            if(!updatedReview) throw new Error("Review block status updating failed");
            
            return { success: true, message: "Review block status updated" };
        } catch (error) {
            console.log("AdminUpdateReviewBlockStatusUseCase error :", error);
            throw new Error("Failed to update review block status");
        }
    }
}
