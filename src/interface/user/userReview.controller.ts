import { Types } from "mongoose";
import { Request, Response } from "express";
import { DecodedUser } from "../../express";
import { Role } from "../../infrastructure/dtos/common.dto";
import { HandleError } from "../../infrastructure/error/error";
import { UserCreateReviewZodSchema } from "../../infrastructure/zod/user.zod";
import { RequestQueryFetchAllReviewsZodSchema } from "../../infrastructure/zod/common.zod";
import { FetchAllReviewsUseCase } from "../../application/common-use.case/fetchReviews.use-case";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { CreateReviewUseCase, DeleteReviewUseCase } from "../../application/user-use.case/userReview.use-case";

const reviewRepositoryImpl = new ReviewRepositoryImpl();
const createReviewUseCase = new CreateReviewUseCase(reviewRepositoryImpl);
const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepositoryImpl);
const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewRepositoryImpl);

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

    async createReview(req: Request, res: Response) {
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
            HandleError.handle(error, res);
        }
    }


    async deleteReview(req: Request, res: Response) {
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
            HandleError.handle(error, res);
        }
    }

    async findAllReviews(req: Request, res: Response) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const providerId = req.params.providerId;
            const { limit, page, role } = RequestQueryFetchAllReviewsZodSchema.parse(req.query);
            const result = await this.fetchAllReviewsUseCase.execute({
                page,
                limit,
                userId: role === Role.user ? new Types.ObjectId(userId) : undefined,
                providerId: role === Role.provider ? new Types.ObjectId(providerId) : undefined,
                role: Role.user
            });
            res.status(200).json(result);
        } catch (error) {
            console.log("findAllReviews error : ", error);
            HandleError.handle(error, res);
        }
    }

}

const userReviewController = new UserReviewController(createReviewUseCase, deleteReviewUseCase, fetchAllReviewsUseCase);
export { userReviewController };