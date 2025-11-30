import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { roleArray } from "../../infrastructure/helpers/constants";
import { UserCreateReviewZodSchema } from "../../infrastructure/zod/user.zod";
import { RequestQueryFetchAllReviewsZodSchema } from "../../infrastructure/zod/common.zod";
import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { FetchAllReviewsUseCase } from "../../application/common-use.case/fetchReviews.use-case";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { CreateReviewUseCase, DeleteReviewUseCase } from "../../application/user-use.case/userReview.use-case";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";

const reviewRepositoryImpl = new ReviewRepositoryImpl();
const signedUrlCacheRepositoryImpl = new SignedUrlCacheRepositoryImpl();

const generateSignedUrlService = new GenerateSignedUrlService(signedUrlCacheRepositoryImpl);

const createReviewUseCase = new CreateReviewUseCase(reviewRepositoryImpl);
const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepositoryImpl);
const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewRepositoryImpl, generateSignedUrlService);

export class UserReviewController {
    constructor(
        private createReviewUseCase: CreateReviewUseCase,
        private deleteReviewUseCase: DeleteReviewUseCase,
        private fetchAllReviewsUseCase: FetchAllReviewsUseCase,
    ) {
        this.createReview = this.createReview.bind(this);
        this.findAllReviews = this.findAllReviews.bind(this);
        this.deleteReview = this.deleteReview.bind(this);
    }

    async createReview(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const validateData = UserCreateReviewZodSchema.parse(req.body);
            const { providerId, bookingId, reviewText, rating } = validateData;
            const result = await this.createReviewUseCase.execute({
                providerId: new Types.ObjectId(providerId),
                userId: new Types.ObjectId(userId),
                reviewText,
                rating,
                bookingId: new Types.ObjectId(bookingId)
            }); res.status(201).json(result);
        } catch (error) {
            console.log("createReview error : ", error);
            next(error)
        }
    }


    async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const reviewId = req.params.reviewId;
            const result = await this.deleteReviewUseCase.execute({
                reviewId: new Types.ObjectId(reviewId),
                userId: new Types.ObjectId(userId)
            });
            res.status(200).json(result);
        } catch (error) {
            console.log("findAllReviews error : ", error);
            next(error)
        }
    }

    async findAllReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const providerId = req.params.providerId;
            const { limit, page, role } = RequestQueryFetchAllReviewsZodSchema.parse(req.query);
            const result = await this.fetchAllReviewsUseCase.execute({
                page,
                limit,
                userId: role === roleArray[1] ? new Types.ObjectId(userId) : undefined,
                providerId: role === roleArray[2] ? new Types.ObjectId(providerId) : undefined,
                role: roleArray[1]
            });
            res.status(200).json(result);
        } catch (error) {
            console.log("findAllReviews error : ", error);
            next(error)
        }
    }

}

const userReviewController = new UserReviewController(createReviewUseCase, deleteReviewUseCase, fetchAllReviewsUseCase);
export { userReviewController };