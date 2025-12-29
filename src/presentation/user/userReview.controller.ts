import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/role.enum";
import { roleArray } from "../../shared/utils/constants";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { UserCreateReviewZodSchema } from "../../shared/zod/user.zod";
import { RequestQueryFetchAllReviewsZodSchema } from "../../shared/zod/common.zod";
import { createReviewUseCase, deleteReviewUseCase, fetchAllReviewsUseCase } from ".";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { CreateReviewUseCase, DeleteReviewUseCase } from "../../application/useCases/user/userReview.useCase";

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
            const userId = (req.user as DecodedUser).userOrProviderId;
            const validateData = UserCreateReviewZodSchema.parse(req.body);
            const { providerId, bookingId, reviewText, rating } = validateData;
            const result = await this.createReviewUseCase.execute({
                providerId,
                userId,
                reviewText,
                rating,
                bookingId
            });
            sendResponse(res, result,"Review saved successfully",true, 201);
        } catch (error) {
            log.error("createReview failed", error as Error);
            next(error);
        };
    };

    async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const reviewId = req.params.reviewId;
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
            const userId = (req.user as DecodedUser).userOrProviderId;
            const providerId = req.params.providerId;
            const { limit, page, role } = RequestQueryFetchAllReviewsZodSchema.parse(req.query);
            const result = await this.fetchAllReviewsUseCase.execute({
                page,
                limit,
                userId: role === Role.User ? userId : undefined,
                providerId: role === Role.Provider ? providerId : undefined,
                role: roleArray[1]
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
