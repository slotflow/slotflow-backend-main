import { ApiResponse } from "../../../infrastructure/dtos/common.dto";
import { AdminUpdateReviewBlockStatusRequest } from "../../../infrastructure/dtos/admin.dto";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";

export class AdminUpdateReviewBlockStatusUseCase {
    constructor(
        private reviewRepository: IReviewRepository,
    ) { }

    async execute(payload: AdminUpdateReviewBlockStatusRequest): Promise<ApiResponse> {
        try {
            const { reviewId } = payload;

            const review = await this.reviewRepository.findReviewById(reviewId);
            if(!review) throw new Error("No review found");

            review.isBlocked = !review.isBlocked;

            const updatedReview = await this.reviewRepository.updateReview(review);
            if(!updatedReview) throw new Error("Review block status updating failed");
            
            return { success: true, message: "Review block status updated" };
        } catch (error) {
            console.log("AdminUpdateReviewBlockStatusUseCase error :", error);
            throw new Error("Failed to update review block status");
        }
    }
}
