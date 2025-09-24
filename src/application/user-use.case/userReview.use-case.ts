import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { Validator } from "../../infrastructure/validator/validator";
import { CreateReviewRequset, UserDeleteReviewRequest } from "../../infrastructure/dtos/user.dto";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";

export class CreateReviewUseCase {
    constructor(
        private reviewRepositoryImpl: ReviewRepositoryImpl,
    ) { }

    async execute(payload: CreateReviewRequset): Promise<ApiResponse> {

        const { providerId, rating, reviewText, userId, bookingId } = payload;

        if(!providerId || !userId || !rating || !reviewText ) throw new Error("Invalid request");

        Validator.validateObjectId(providerId, "Provider Id");
        Validator.validateObjectId(userId, "User Id");
        Validator.validateObjectId(bookingId, "Booking Id");
        Validator.validateReviewText(reviewText);
        Validator.validateRating(rating);

        const newReview = await this.reviewRepositoryImpl.createReview({providerId, userId, reviewText, rating, bookingId});
        if(!newReview) throw new Error("Review adding failed");

        return { success: true, message: "Review added successfully" };
    }
}


export class DeleteReviewUseCase {
    constructor(
        private reviewRepositoryImpl: ReviewRepositoryImpl,
    ) { }

    async execute(payload: UserDeleteReviewRequest): Promise<ApiResponse> {

        const { reviewId, userId } = payload;

        if(!reviewId || !userId ) throw new Error("Invalid request");

        Validator.validateObjectId(reviewId, "Review Id");
        Validator.validateObjectId(userId, "User Id");

        const booking = await this.reviewRepositoryImpl.findReviewById(reviewId);
        if(!booking) throw new Error("Review deleting failed");

        if(booking.userId.toString() !== userId.toString()) throw new Error("Invalid request");

        const result = await this.reviewRepositoryImpl.deleteReview(reviewId);
        if(!result) throw new Error("Review deleting failed");

        return { success: true, message: "Review deleted successfully" };
    }
}