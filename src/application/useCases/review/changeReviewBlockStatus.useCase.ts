import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { NotFoundError, AppError, BadRequestError } from "../../../shared/error/appError";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";
import { ChangeReviewBlockStatusInput, ChangeReviewBlockStatusOutput } from "../../dtos/admin.dto";

export class ToggleReviewBlockStatusUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(input: ChangeReviewBlockStatusInput): Promise<ChangeReviewBlockStatusOutput> {
    try {
      const { reviewId, isBlocked } = input;
      if (!reviewId) {
        throw new BadRequestError();
      }

      const review = await this.reviewRepository.findById(reviewId);
      if (!review) {
        throw new NotFoundError("Review not found", ERROR_CODES.REVIEW_NOT_FOUND);
      }

      if (isBlocked) {
        review.block();
      } else {
        review.unblock();
      }

      const updatedReview = await this.reviewRepository.update(review);
      if (!updatedReview) {
        throw new AppError(
          "Review block status updating failed",
          500,
          true,
          ERROR_CODES.INTERNAL_ERROR,
        );
      }

      return { _id: updatedReview._id, isBlocked: updatedReview.isBlocked };
    } catch (error: unknown) {
      throw toAppError(error, "Failed to change review block status");
    }
  }
}
