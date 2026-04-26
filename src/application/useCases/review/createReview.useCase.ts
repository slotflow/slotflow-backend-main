import { CreateReviewInput } from "../../dtos/review.dto";
import { ERROR_CODES } from "../../../shared/utils/types";
import { Review } from "../../../domain/entities/review.entity";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError } from "../../../shared/error/appError";
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

            const newReview = await this.reviewRepository.create(review);
            if (!newReview) {
                throw new AppError(
                    "Internal server error",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create review");
        };
    };
};