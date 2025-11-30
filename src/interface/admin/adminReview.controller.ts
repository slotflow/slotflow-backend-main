import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { roleArray } from "../../infrastructure/helpers/constants";
import { RequestQueryFetchAllReviewsZodSchema } from "../../infrastructure/zod/common.zod";
import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { FetchAllReviewsUseCase } from "../../application/common-use.case/fetchReviews.use-case";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { AdminUpdateReviewBlockStatusUseCase } from "../../application/admin-use.case/adminReview.use-case";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";

const reviewRepositoryImpl = new ReviewRepositoryImpl();
const signedUrlCacheRepositoryImpl = new SignedUrlCacheRepositoryImpl();

const generateSignedUrlService = new GenerateSignedUrlService(signedUrlCacheRepositoryImpl);

const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewRepositoryImpl, generateSignedUrlService);
const adminUpdateReviewBlockStatusUseCase = new AdminUpdateReviewBlockStatusUseCase(reviewRepositoryImpl);

export class AdminReviewController {
    constructor(
        private fetchAllReviewsUseCase: FetchAllReviewsUseCase,
        private adminUpdateReviewBlockStatusUseCase: AdminUpdateReviewBlockStatusUseCase,
    ) {
        this.findAllReviews = this.findAllReviews.bind(this);
        this.updateReviewBlockStatus = this.updateReviewBlockStatus.bind(this);
    }
    
    async findAllReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId;
            const { limit, page, role } = RequestQueryFetchAllReviewsZodSchema.parse(req.query);
            const result = await this.fetchAllReviewsUseCase.execute({
                page,
                limit,
                userId: role === roleArray[1] ? new Types.ObjectId(userId) : undefined,
                providerId: role === roleArray[2] ? new Types.ObjectId(userId) : undefined,
                role,
            });
            res.status(200).json(result)
        } catch (error) {
            console.log("findAllReviewsOfUser error : ", error);
            next(error)
        }
    }


    async updateReviewBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const reviewId = req.params.reviewId;
            const result = await this.adminUpdateReviewBlockStatusUseCase.execute({reviewId: new Types.ObjectId(reviewId)});
            res.status(200).json(result);
        } catch (error) {
            console.log("updateReviewBlockStatus error : ",error);
            next(error)
        }
    }

}

const adminReviewController = new AdminReviewController(fetchAllReviewsUseCase, adminUpdateReviewBlockStatusUseCase);
export { adminReviewController };