import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { roleArray } from "../../shared/utils/constants";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { FetchAllReviewsUseCase } from "../../application/common-use.case/fetchReviews.use-case";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { ProviderReportReviewUseCase } from "../../application/provider-use.case/providerReview.use-case";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";

const reviewRepositoryImpl = new ReviewRepositoryImpl();
const signedUrlCacheRepositoryImpl = new SignedUrlCacheRepositoryImpl();

const generateSignedUrlService = new GenerateSignedUrlService(signedUrlCacheRepositoryImpl);

const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewRepositoryImpl, generateSignedUrlService);
const providerReportReviewUseCase = new ProviderReportReviewUseCase(reviewRepositoryImpl);

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