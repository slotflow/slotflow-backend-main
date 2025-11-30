import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { CreateReviewRequset, UserDeleteReviewRequest } from "../../infrastructure/dtos/user.dto";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";

export class CreateReviewUseCase {
    constructor(
        private reviewRepositoryImpl: ReviewRepositoryImpl,
    ) { }

    async execute(payload: CreateReviewRequset): Promise<ApiResponse> {
        try {
            const { providerId, rating, reviewText, userId, bookingId } = payload;

            if (!providerId || !userId || !rating || !reviewText) throw new Error("Invalid request");

            const newReview = await this.reviewRepositoryImpl.createReview({ providerId, userId, reviewText, rating, bookingId });
            if (!newReview) throw new Error("Review adding failed");

            return { success: true, message: "Review added successfully" };
        } catch (error) {
            console.log("CreateReviewUseCase error : ", error);
            throw new Error("Failed to create review");
        }
    }
}


export class DeleteReviewUseCase {
    constructor(
        private reviewRepositoryImpl: ReviewRepositoryImpl,
    ) { }

    async execute(payload: UserDeleteReviewRequest): Promise<ApiResponse> {
        try {
            const { reviewId, userId } = payload;

            if (!reviewId || !userId) throw new Error("Invalid request");

            const booking = await this.reviewRepositoryImpl.findReviewById(reviewId);
            if (!booking) throw new Error("Review deleting failed");

            if (booking.userId.toString() !== userId.toString()) throw new Error("Invalid request");

            const result = await this.reviewRepositoryImpl.deleteReview(reviewId);
            if (!result) throw new Error("Review deleting failed");

            return { success: true, message: "Review deleted successfully" };
        } catch (error) {
            console.log("DeleteReviewUseCase error : ", error);
            throw new Error("Failed to delete review");
        }
    }
}