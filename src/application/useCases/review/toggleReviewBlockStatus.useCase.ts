import { log } from "../../../shared/logger/logger";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";
import { ToggleReviewBlockStatusInput, ToggleReviewBlockStatusOutput } from "../../dtos/admin.dto";

export class ToggleReviewBlockStatusUseCase {
    constructor(
        private reviewRepository: IReviewRepository,
    ) { };

    async execute(input: ToggleReviewBlockStatusInput): Promise<ToggleReviewBlockStatusOutput> {
        try {
            const { reviewId, isBlocked } = input;

            const review = await this.reviewRepository.findById(reviewId);
            if (!review) throw new Error("No review found");

            if (review.isBlocked === isBlocked) {
                isBlocked ? review.unblock() : review.block();;
            };

            const updatedReview = await this.reviewRepository.update(review);
            if (!updatedReview) throw new Error("Review block status updating failed");

            return { reviewId, isBlocked: updatedReview.isBlocked };
        } catch (error) {
            log.error("ToggleReviewBlockStatusUseCase failed", error as Error);
            throw error;
        };
    };
};
