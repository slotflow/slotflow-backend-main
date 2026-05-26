import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { NotFoundError, AppError, BadRequestError } from "../../../shared/error/appError";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";
import { ToggleReviewBlockStatusInput, ToggleReviewBlockStatusOutput } from "../../dtos/admin.dto";

export class ToggleReviewBlockStatusUseCase {
    constructor(
        private readonly reviewRepository: IReviewRepository,
    ) { };

    async execute(input: ToggleReviewBlockStatusInput): Promise<ToggleReviewBlockStatusOutput> {
        try {
            const { reviewId, isBlocked } = input;
            if (!reviewId) {
                throw new BadRequestError();
            }

            const review = await this.reviewRepository.findById(reviewId);
            if (!review) {
                throw new NotFoundError(
                    "Review not found",
                    ERROR_CODES.REVIEW_NOT_FOUND
                );
            }

            if (review.isBlocked === isBlocked) {
                isBlocked ? review.unblock() : review.block();;
            };

            const updatedReview = await this.reviewRepository.update(review);
            if (!updatedReview) {
                throw new AppError(
                    "Review block status updating failed",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            return { reviewId, isBlocked: updatedReview.isBlocked };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to change review block status");
        };
    };
};
