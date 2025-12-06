import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { roleArray } from "../../shared/utils/constants";
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

const reviewRepository: IReviewRepository = new ReviewRepositoryImpl();
const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepository);

const providerReportReviewUseCase = new ProviderReportReviewUseCase(reviewRepository);
const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewRepository, signedUrlService);

export class ProviderReviewController {
    constructor(
        private fetchAllReviewsUseCase: FetchAllReviewsUseCase,
        private providerReportReviewUseCase: ProviderReportReviewUseCase,
    ) {
        this.findAllReviews = this.findAllReviews.bind(this);
        this.chnageReportReview = this.chnageReportReview.bind(this);
    }

    async findAllReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { limit, page } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.fetchAllReviewsUseCase.execute({
                page,
                limit,
                providerId: new Types.ObjectId(providerId),
                role: roleArray[2]
            });
            res.status(200).json(result)
        } catch (error) {
            console.log("findAllReviews error : ", error);
            next(error)
        }
    }
    
    async chnageReportReview(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const reviewId = req.params.reviewId;
            const result = await this.providerReportReviewUseCase.execute({
                reviewId: new Types.ObjectId(reviewId), 
                providerId: new Types.ObjectId(providerId)
            });
            res.status(200).json(result);
        } catch(error) {
            console.log("reportReview error : ",error);
            next(error)
        }
    }

}

const providerReviewController = new ProviderReviewController(fetchAllReviewsUseCase, providerReportReviewUseCase);
export { providerReviewController };