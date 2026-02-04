import { log } from "../../../shared/logger/logger";
import { Review } from "../../../domain/entities/review.entity";
import { CreateReviewRequset, UserDeleteReviewRequest } from "../../dtos/user.dto";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";

export class CreateReviewUseCase {
    constructor(
        private reviewRepository: IReviewRepository,
    ) { };

    async execute(payload: CreateReviewRequset): Promise<void> {
        try {
            const { providerId, rating, reviewText, userId, bookingId } = payload;

            if (!providerId || !userId || !rating || !reviewText) throw new Error("Invalid request");

            const review = Review.create({
                providerId,
                rating,
                reviewText,
                userId,
                bookingId,
            });

            await this.reviewRepository.create(review);
        } catch (error) {
            log.error("CreateReviewUseCase failed", error as Error);
            throw error;
        };
    };
};


export class DeleteReviewUseCase {
    constructor(
        private reviewRepository: IReviewRepository,
    ) { };

    async execute(payload: UserDeleteReviewRequest): Promise<void> {
        try {
            const { reviewId, userId } = payload;

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