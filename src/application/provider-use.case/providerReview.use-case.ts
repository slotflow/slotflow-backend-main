import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { ProviderRepostReviewRequest } from "../../infrastructure/dtos/provider.dto";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";

export class ProviderReportReviewUseCase {
    constructor(
        private reviewRepositoryImpl: ReviewRepositoryImpl,
    ) { }

    async execute(payload: ProviderRepostReviewRequest): Promise<ApiResponse> {
        try {
            const { providerId, reviewId } = payload;

            const review = await this.reviewRepositoryImpl.findReviewById(reviewId);
            if (!review) throw new Error("No review found");

            if (review.providerId.toString() !== providerId.toString()) throw new Error("You are not permitted to report this review");

            review.reported = !review.reported;

            const updatedReview = await this.reviewRepositoryImpl.updateReview(review);
            if (!updatedReview) throw new Error("Review reporting failed");

            console.log("updatedReview : ", updatedReview);

            return { success: true, message: `Review ${updatedReview.reported ? "reported" : "unreported"} successfully` };
        } catch (error) {
            console.log("ProviderReportReviewUseCase error : ", error);
            throw new Error("Failed to report review");
        }
    }
}