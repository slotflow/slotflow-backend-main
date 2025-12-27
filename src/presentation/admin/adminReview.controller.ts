import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/role.enum";
import { redis } from "../../infrastructure/lib/redis";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { s3Client } from "../../infrastructure/lib/aws_s3";
import { IReviewQueries } from "../../application/queries/IReview.queries";
import { ReviewQueriesImpl } from "../../infrastructure/queries/reviewQueries.impl";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { SignedUrlServiceImpl } from "../../infrastructure/services/signedUrlService.impl";
import { IReviewRepository } from "../../domain/interfaces/repositories/IReview.repository";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { AdminUpdateReviewBlockStatusUseCase } from "../../application/useCases/admin/adminReview.useCase";
import { changeBlockStatusZodSchema, RequestQueryFetchAllReviewsZodSchema } from "../../shared/zod/common.zod";

const reviewRepository: IReviewRepository = new ReviewRepositoryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlServiceImpl(redis, s3Client);

const reviewQueries: IReviewQueries = new ReviewQueriesImpl();

const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewQueries, signedUrlService);
const adminUpdateReviewBlockStatusUseCase = new AdminUpdateReviewBlockStatusUseCase(reviewRepository);

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
