import { CreateReviewInput } from "../../dtos/review.dto";
import { Review } from "../../../domain/entities/review.entity";
import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";

export class CreateReviewUseCase {
    constructor(
        private readonly reviewRepository: IReviewRepository,
    ) { };

    async execute(input: CreateReviewInput): Promise<void> {
        try {
            const { providerId, rating, reviewText, userId, bookingId } = input;
            if (!providerId ||
                !rating ||
                !reviewText ||
                !userId ||
                !bookingId
            ) {
                throw new BadRequestError();
            }

            const review = Review.create({
                providerId,
                rating,
                reviewText,
                userId,
                bookingId,
            });

            await this.reviewRepository.create(review);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create review");
        };
    };
};