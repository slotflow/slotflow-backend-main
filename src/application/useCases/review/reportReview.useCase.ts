import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ReportReviewInput, ReportReviewOutput } from "../../dtos/review.dto";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";

export class ReportReviewUseCase {
    constructor(
        private readonly reviewRepository: IReviewRepository,
    ) { };

    async execute(input: ReportReviewInput): Promise<ReportReviewOutput> {
        try {
            const { providerId, reviewId, reported } = input;
            if (!reviewId || !providerId) {
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

            if (reported) {
                review.report()
            } else {
                review.unreport();
            };

            const updatedReview = await this.reviewRepository.update(review);
            if (!updatedReview) {
                throw new AppError(
                    "Failed to update review",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            return {
                _id: updatedReview._id,
                reported: updatedReview.reported
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to report review");
        };
    };
};