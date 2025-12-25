import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/role.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { IReviewQueries } from "../../application/queries/IReview.queries";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { ReviewQueriesImpl } from "../../infrastructure/queries/reviewQueries.impl";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { IReviewRepository } from "../../domain/interfaces/repositories/IReview.repository";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { ISignedUrlCacheRepository } from "../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { ProviderChangeReviewRepostStatusUseCase } from "../../application/useCases/provier/providerReview.useCase";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";

const reviewRepository: IReviewRepository = new ReviewRepositoryImpl();
const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();

const reviewQueries: IReviewQueries = new ReviewQueriesImpl();
const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepository);

const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewQueries, signedUrlService);
const providerChangeReviewRepostStatusUseCase = new ProviderChangeReviewRepostStatusUseCase(reviewRepository);

export class ProviderReviewController {
    constructor(
        private fetchAllReviewsUseCase: FetchAllReviewsUseCase,
        private providerChangeReviewRepostStatusUseCase: ProviderChangeReviewRepostStatusUseCase,
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
            const result = await this.providerChangeReviewRepostStatusUseCase.execute({
                reviewId,
                providerId
            });
            sendResponse(res, result, `Review ${result ? "reported" : "unreported"} successfully`);
        } catch (error) {
            log.error("reportReview failed", error as Error);
            next(error);
        };
    };

};

export const providerReviewController = new ProviderReviewController(
    fetchAllReviewsUseCase,
    providerChangeReviewRepostStatusUseCase
);
