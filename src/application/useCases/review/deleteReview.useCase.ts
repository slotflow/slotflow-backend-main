import { log } from "../../../shared/logger/logger";
import { UserDeleteReviewRequest } from "../../dtos/user.dto";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";

export class DeleteReviewUseCase {
    constructor(
        private reviewRepository: IReviewRepository,
    ) { };

    async execute(input: UserDeleteReviewRequest): Promise<void> {
        try {
            const { reviewId, userId } = input;

            if (!reviewId || !userId) throw new Error("Invalid request");

            const review = await this.reviewRepository.findById(reviewId);
            if (!review) throw new Error("No review found");

            if (review.userId !== userId) throw new Error("Invalid request");

            const result = await this.reviewRepository.deleteById(reviewId);
            if (!result) throw new Error("Review deleting failed");
        } catch (error) {
            log.error("DeleteReviewUseCase failed", error as Error);
            throw error;
        };
    };
};