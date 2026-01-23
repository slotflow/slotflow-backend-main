import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { createReviewUseCase, deleteReviewUseCase, fetchAllReviewsUseCase } from ".";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { CreateReviewUseCase, DeleteReviewUseCase } from "../../application/useCases/user/userReview.useCase";
import { userCreateReviewSchema, userDeleteReviewSchema, userFetchAllReviewsSchema } from "../../shared/zod/user.zod";
import { Role } from "../../domain/enums/common.enum";

class UserReviewController {
    constructor(
        private createReviewUseCase: CreateReviewUseCase,
        private deleteReviewUseCase: DeleteReviewUseCase,
        private fetchAllReviewsUseCase: FetchAllReviewsUseCase,
    ) {
        this.createReview = this.createReview.bind(this);
        this.findAllReviews = this.findAllReviews.bind(this);
        this.deleteReview = this.deleteReview.bind(this);
    };

    async createReview(req: Request, res: Response, next: NextFunction) {
        try {
            const { bookingId, providerId, rating, reviewText, userId } = userCreateReviewSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.createReviewUseCase.execute({
                providerId,
                userId,
                reviewText,
                rating,
                bookingId
            });
            sendResponse(res, result, "Review saved successfully", true, 201);
        } catch (error) {
            log.error("createReview failed", error as Error);
            next(error);
        };
    };

    async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            const { reviewId, userId } = userDeleteReviewSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                reviewId: req.params.reviewId
            });
            await this.deleteReviewUseCase.execute({
                reviewId,
                userId
            });
            sendResponse(res, null, "Review deleted successfully");
        } catch (error) {
            log.error("findAllReviews failed", error as Error);
            next(error);
        };
    };

    async findAllReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const { limit, page, providerId, userId, role } = userFetchAllReviewsSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                providerId:  req.params.providerId,
                ...req.query
            });
            const result = await this.fetchAllReviewsUseCase.execute({
                page,
                limit,
                userId: role === Role.USER ? userId : undefined,
                providerId: role === Role.PROVIDER ? providerId : undefined,
                role
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("findAllReviews failed", error as Error);
            next(error);
        };
    };

};

export const userReviewController = new UserReviewController(
    createReviewUseCase,
    deleteReviewUseCase,
    fetchAllReviewsUseCase
);
