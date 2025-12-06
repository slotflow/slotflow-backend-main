import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { roleArray } from "../../shared/utils/constants";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { RequestQueryFetchAllReviewsZodSchema } from "../../shared/zod/common.zod";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { IReviewRepository } from "../../domain/interfaces/repositories/IReview.repository";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { AdminUpdateReviewBlockStatusUseCase } from "../../application/useCases/admin/adminReview.useCase";
import { ISignedUrlCacheRepository } from "../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";

const reviewRepository: IReviewRepository = new ReviewRepositoryImpl();
const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepository);

const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewRepository, signedUrlService);
const adminUpdateReviewBlockStatusUseCase = new AdminUpdateReviewBlockStatusUseCase(reviewRepository);

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