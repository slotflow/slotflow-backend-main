import { ERROR_CODES } from "../../../shared/utils/types";
import { UserDeleteReviewInput } from "../../dtos/review.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";

export class DeleteReviewUseCase {
    constructor(
        private readonly reviewRepository: IReviewRepository,
    ) { };

    async execute(input: UserDeleteReviewInput): Promise<void> {
        try {
            const { reviewId, userId } = input;
            if (!reviewId || !userId) {
                throw new BadRequestError();
            }

            const review = await this.reviewRepository.findById(reviewId);
            if (!review) {
                throw new NotFoundError(
                    "No review found",
                    ERROR_CODES.REVIEW_NOT_FOUND
                );
            }

            if (review.userId !== userId) {
                throw new BadRequestError();
            }

            const result = await this.reviewRepository.deleteById(reviewId);
            if (!result) {
                throw new AppError(
                    "Failed to delete review",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR);
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to delete review")
        };
    };
};