import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { IReviewRepository } from "../../domain/interfaces/repositories/IReview.repository";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { ProviderReportReviewUseCase } from "../../application/useCases/provier/providerReview.useCase";
import { ISignedUrlCacheRepository } from "../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { IReviewQueries } from "../../application/queries/IReview.queries";
import { ReviewQueriesImpl } from "../../infrastructure/queries/reviewQueries.impl";
import { Role } from "../../domain/enums/role.enum";
import { sendResponse } from "../../shared/utils/response";
import { log } from "../../shared/logger/logger";

const reviewRepository: IReviewRepository = new ReviewRepositoryImpl();
const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepository);
const reviewQueries: IReviewQueries = new ReviewQueriesImpl();

const providerReportReviewUseCase = new ProviderReportReviewUseCase(reviewRepository);
const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewQueries, signedUrlService);

export class ProviderReviewController {
    constructor(
        private fetchAllReviewsUseCase: FetchAllReviewsUseCase,
        private providerReportReviewUseCase: ProviderReportReviewUseCase,
    ) {
        this.findAllReviews = this.findAllReviews.bind(this);
        this.chnageReportReview = this.chnageReportReview.bind(this);
    };

    async findAllReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { limit, page } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.fetchAllReviewsUseCase.execute({
                page,
                limit,
                providerId,
                role: Role.Provider
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("findAllReviews failed", error as Error);
            next(error);
        };
    };

    async chnageReportReview(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const reviewId = req.params.reviewId;
            const result = await this.providerReportReviewUseCase.execute({
                reviewId,
                providerId
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("reportReview failed", error as Error);
            next(error);
        };
    };

};

export const providerReviewController = new ProviderReviewController(
    fetchAllReviewsUseCase,
    providerReportReviewUseCase
);
