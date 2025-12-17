import { ApiResponse } from "../../dtos/common.dto";
import { ProviderRepostReviewRequest } from "../../dtos/provider.dto";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";

export class ProviderReportReviewUseCase {
    constructor(
        private reviewRepository: IReviewRepository,
    ) { }

    async execute(payload: ProviderRepostReviewRequest): Promise<ApiResponse> {
        try {
            const { providerId, reviewId } = payload;

            const review = await this.reviewRepository.findReviewById(reviewId);
            if (!review) throw new Error("No review found");

            if (review.providerId.toString() !== providerId.toString()) throw new Error("You are not permitted to report this review");

            review.reported = !review.reported;

            const updatedReview = await this.reviewRepository.updateReview(review);
            if (!updatedReview) throw new Error("Review reporting failed");

            console.log("updatedReview : ", updatedReview);

            return { success: true, message: `Review ${updatedReview.reported ? "reported" : "unreported"} successfully` };
        } catch (error) {
            console.log("ProviderReportReviewUseCase error : ", error);
            throw new Error("Failed to report review");
        }
    }
}