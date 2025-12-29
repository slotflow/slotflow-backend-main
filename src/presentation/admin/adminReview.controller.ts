import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/role.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { adminUpdateReviewBlockStatusUseCase, fetchAllReviewsUseCase } from ".";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { AdminUpdateReviewBlockStatusUseCase } from "../../application/useCases/admin/adminReview.useCase";
import { changeBlockStatusZodSchema, RequestQueryFetchAllReviewsZodSchema } from "../../shared/zod/common.zod";

class AdminReviewController {
    constructor(
        private fetchAllReviewsUseCase: FetchAllReviewsUseCase,
        private adminUpdateReviewBlockStatusUseCase: AdminUpdateReviewBlockStatusUseCase,
    ) {
        this.findAllReviews = this.findAllReviews.bind(this);
        this.updateReviewBlockStatus = this.updateReviewBlockStatus.bind(this);
    };

    async findAllReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId;
            const { limit, page, role } = RequestQueryFetchAllReviewsZodSchema.parse(req.query);
            const result = await this.fetchAllReviewsUseCase.execute({
                page,
                limit,
                userId: role === Role.User ? userId : undefined,
                providerId: role === Role.Provider ? userId : undefined,
                role,
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("findAllReviewsOfUser failed", error as Error);
            next(error);
        };
    };


    async updateReviewBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus } = changeBlockStatusZodSchema.parse(req.body);
            const reviewId = req.params.reviewId;
            const result = await this.adminUpdateReviewBlockStatusUseCase.execute({ reviewId, isBlocked: blockStatus });
            sendResponse(res, result);
        } catch (error) {
            log.error("updateReviewBlockStatus failed", error as Error);
            next(error);
        };
    };

};

export const adminReviewController = new AdminReviewController(
    fetchAllReviewsUseCase,
    adminUpdateReviewBlockStatusUseCase
);
