import { RepostReviewInput } from "../../dtos/review.dto";
import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";

export class ReportReviewUseCase {
    constructor(
        private readonly reviewRepository: IReviewRepository,
    ) { };

    async execute(input: RepostReviewInput): Promise<boolean> {
        try {
            const { providerId, reviewId } = input;
            if(!reviewId || !providerId) {
                throw new BadRequestError();
            }

            const review = await this.reviewRepository.findById(reviewId);
            if (!review) {
                throw new NotFoundError(
                    "Review not found",
                    ERROR_CODES.REVIEW_NOT_FOUND
                );
            }

            if (review.providerId !== providerId) {
                throw new BadRequestError();
            };

            if (review.reported) {
                review.unreport();
            } else {
                review.report()
            };

            const updatedReview = await this.reviewRepository.update(review);
            if(!updatedReview) {
                throw new AppError(
                    "Failed to update review",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            return updatedReview.reported;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to report review");
        };
    };
};