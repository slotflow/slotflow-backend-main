import { Types } from "mongoose";
import { Request, Response } from "express";
import { DecodedUser } from "../../express";
import { Role } from "../../infrastructure/dtos/common.dto";
import { HandleError } from "../../infrastructure/error/error";
import { RequestQueryCommonZodSchema } from "../../infrastructure/zod/common.zod";
import { FetchAllReviewsUseCase } from "../../application/common-use.case/fetchReviews.use-case";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { ProviderReportReviewUseCase } from "../../application/provider-use.case/providerReview.use-case";

const reviewRepositoryImpl = new ReviewRepositoryImpl();
const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewRepositoryImpl);
const providerReportReviewUseCase = new ProviderReportReviewUseCase(reviewRepositoryImpl);

export class ProviderReviewController {
    constructor(
        private fetchAllReviewsUseCase: FetchAllReviewsUseCase,
        private providerReportReviewUseCase: ProviderReportReviewUseCase,
    ) {
        this.findAllReviews = this.findAllReviews.bind(this);
        this.chnageReportReview = this.chnageReportReview.bind(this);
    }

    async findAllReviews(req: Request, res: Response) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { limit, page } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.fetchAllReviewsUseCase.execute({
                page,
                limit,
                providerId: new Types.ObjectId(providerId),
                role: Role.provider
            });
            res.status(200).json(result)
        } catch (error) {
            console.log("findAllReviews error : ", error);
            HandleError.handle(error, res);
        }
    }
    
    async chnageReportReview(req: Request, res: Response) {
        try {
            console.log("Review reporting")
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const reviewId = req.params.reviewId;
            console.log("providerId : ",providerId);
            console.log("reviewId : ",reviewId);
            const result = await this.providerReportReviewUseCase.execute(new Types.ObjectId(reviewId), new Types.ObjectId(providerId));
            console.log("result : ",result);
            res.status(200).json(result);
        } catch(error) {
            console.log("reportReview error : ",error);
            HandleError.handle(error, res);
        }
    }

}

const providerReviewController = new ProviderReviewController(fetchAllReviewsUseCase, providerReportReviewUseCase);
export { providerReviewController };