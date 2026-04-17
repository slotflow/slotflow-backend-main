import { log } from "../../../shared/logger/logger";
import { RepostReviewInput } from "../../dtos/review.dto";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";

export class ReportReviewUseCase {
    constructor(
        private reviewRepository: IReviewRepository,
    ) { };

    async execute(input: RepostReviewInput): Promise<boolean> {
        try {
            const { providerId, reviewId } = input;

            const review = await this.reviewRepository.findById(reviewId);
            if (!review) throw new Error("No review found");

            if (review.providerId !== providerId) {
                throw new Error("You are not permitted to report this review");
            };

            if (review.reported) {
                review.unreport();
            } else {
                review.report()
            };

            const updatedReview = await this.reviewRepository.update(review);

            return updatedReview.reported;

        } catch (error) {
            log.error("ProviderReportReviewUseCase failed", error as Error);
            throw error;
        };
    };
};