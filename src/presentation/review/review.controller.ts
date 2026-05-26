import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { ERROR_CODES } from "../../shared/utils/types";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { BadRequestError } from "../../shared/error/appError";
import { DecodedUser } from "../../application/dtos/common.dto";
import { GetReviewsUseCase } from "../../application/useCases/review/getReviews.useCase";
import { ReportReviewUseCase } from "../../application/useCases/review/reportReview.useCase";
import { CreateReviewUseCase } from "../../application/useCases/review/createReview.useCase";
import { DeleteReviewUseCase } from "../../application/useCases/review/deleteReview.useCase";
import { ToggleReviewBlockStatusUseCase } from "../../application/useCases/review/toggleReviewBlockStatus.useCase";
import { createReviewUseCase, deleteReviewUseCase, getReviewsUseCase, reportReviewUseCase, toggleReviewBlockStatusUseCase } from ".";
import { createReviewSchema, deleteReviewSchema, getReviewsSchema, reportReviewSchema, toggleReviewBlockStatusSchema } from "../../shared/zod/review.zod";

class ReviewController {
    constructor(
        private readonly getReviewsUseCase: GetReviewsUseCase,
        private readonly createReviewUseCase: CreateReviewUseCase,
        private readonly deleteReviewUseCase: DeleteReviewUseCase,
        private readonly reportReviewUseCase: ReportReviewUseCase,
        private readonly toggleReviewBlockStatusUseCase: ToggleReviewBlockStatusUseCase
    ) {
        this.getReviews = this.getReviews.bind(this);
        this.createReview = this.createReview.bind(this);
        this.deleteReview = this.deleteReview.bind(this);
        this.reportReview = this.reportReview.bind(this);
    }

    async getReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { limit, page, providerId, userId } = getReviewsSchema.parse(req.query);
            const filter: {
                providerId?: string;
                userId?: string;
            } = {};
            if (user.role === Role.ADMIN) {
                filter.providerId = providerId;
                filter.userId = userId;
            } else if (user.role === Role.USER) {
                filter.providerId = providerId;
                filter.userId = user.id;
            } else if (user.role === Role.PROVIDER) {
                filter.userId = userId;
            } else {
                throw new BadRequestError("Invalid request", ERROR_CODES.INVALID_REQUEST);
            }

            const result = await this.getReviewsUseCase.execute({
                ...filter,
                page,
                limit,
                role: user.role
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("getReviews failed : ", error as Error);
            next(error);
        }
    }

    async createReview(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { providerId, rating, reviewText, bookingId } = createReviewSchema.parse(req.body);
            const result = await this.createReviewUseCase.execute({
                providerId,
                rating,
                reviewText,
                bookingId,
                userId: user.id
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("createReview failed : ", error as Error);
            next(error);
        }
    }

    async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { reviewId } = deleteReviewSchema.parse(req.params);
            await this.deleteReviewUseCase.execute({
                reviewId,
                userId: user.id
            });
            sendResponse(res, null, "Review deleted successfully");
        } catch (error) {
            log.error("deleteReview failed : ", error as Error);
            next(error);
        }
    }

    async reportReview(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;

            const { reviewId } = reportReviewSchema.parse({
                reviewId: req.params.reviewId
            });
            const result = await this.reportReviewUseCase.execute({
                reviewId,
                providerId: user.id
            });
            sendResponse(res, result, `Review ${result ? "reported" : "unreported"} successfully`);
        } catch (error) {
            log.error("reportReview failed", error as Error);
            next(error);
        };
    };

    async toggleReviewBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus, reviewId } = toggleReviewBlockStatusSchema.parse({
                reviewId: req.params.reviewId,
                blockStatus: req.body.blockStatus
            });
            const result = await this.toggleReviewBlockStatusUseCase.execute({
                reviewId,
                isBlocked: blockStatus
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("toggleReviewBlockStatus failed", error as Error);
            next(error);
        };
    };
}

export const reviewController = new ReviewController(
    getReviewsUseCase,
    createReviewUseCase,
    deleteReviewUseCase,
    reportReviewUseCase,
    toggleReviewBlockStatusUseCase
);