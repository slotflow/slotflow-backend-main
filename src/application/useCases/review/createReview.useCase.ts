import { log } from "../../../shared/logger/logger";
import { CreateReviewRequset } from "../../dtos/user.dto";
import { Review } from "../../../domain/entities/review.entity";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";

export class CreateReviewUseCase {
    constructor(
        private reviewRepository: IReviewRepository,
    ) { };

    async execute(input: CreateReviewRequset): Promise<void> {
        try {
            const { providerId, rating, reviewText, userId, bookingId } = input;

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