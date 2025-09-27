import { Types } from "mongoose";
import { Request, Response } from "express";
import { Role } from "../../infrastructure/dtos/common.dto";
import { HandleError } from "../../infrastructure/error/error";
import { RequestQueryFetchAllReviewsZodSchema } from "../../infrastructure/zod/common.zod";
import { FetchAllReviewsUseCase } from "../../application/common-use.case/fetchReviews.use-case";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { AdminUpdateReviewBlockStatusUseCase } from "../../application/admin-use.case/adminReview.use-case";

const reviewRepositoryImpl = new ReviewRepositoryImpl();
const fetchAllReviewsUseCase = new FetchAllReviewsUseCase(reviewRepositoryImpl);
const adminUpdateReviewBlockStatusUseCase = new AdminUpdateReviewBlockStatusUseCase(reviewRepositoryImpl);

export class AdminReviewController {
    constructor(
        private fetchAllReviewsUseCase: FetchAllReviewsUseCase,
        private adminUpdateReviewBlockStatusUseCase: AdminUpdateReviewBlockStatusUseCase,
    ) {
        this.findAllReviews = this.findAllReviews.bind(this);
        this.updateReviewBlockStatus = this.updateReviewBlockStatus.bind(this);
    }
    
    async findAllReviews(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const { limit, page, role } = RequestQueryFetchAllReviewsZodSchema.parse(req.query);
            const result = await this.fetchAllReviewsUseCase.execute({
                page,
                limit,
                userId: role === Role.user ? new Types.ObjectId(userId) : undefined,
                providerId: role === Role.provider ? new Types.ObjectId(userId) : undefined,
                role,
            });
            res.status(200).json(result)
        } catch (error) {
            console.log("findAllReviewsOfUser error : ", error);
            HandleError.handle(error, res);
        }
    }


    async updateReviewBlockStatus(req: Request, res: Response) {
        try {
            const reviewId = req.params.reviewId;
            console.log("reviewId : ",reviewId);
            const result = await this.adminUpdateReviewBlockStatusUseCase.execute(new Types.ObjectId(reviewId));
            console.log("result : ",result);
            res.status(200).json(result);
        } catch (error) {
            console.log("updateReviewBlockStatus error : ",error);
            HandleError.handle(error, res);
        }
    }

}

const adminReviewController = new AdminReviewController(fetchAllReviewsUseCase, adminUpdateReviewBlockStatusUseCase);
export { adminReviewController };