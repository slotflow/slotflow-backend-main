import { Validator } from "../../infrastructure/validator/validator";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { ApiResponse, FetchReviesRequest, FetchReviewsResponse } from "../../infrastructure/dtos/common.dto";


export class FetchAllReviewsUseCase {
    constructor(
        private reviewRepositoryImpl: ReviewRepositoryImpl,
    ) { }

    async execute(payload: FetchReviesRequest): Promise<ApiResponse<FetchReviewsResponse[]>> {

        const { limit, page, providerId, role, userId } = payload;
        if(providerId) {
            Validator.validateObjectId(providerId, "Provider Id");
        }
        if(userId) {
            Validator.validateObjectId(userId, "User Id");
        }

        const result = await this.reviewRepositoryImpl.findAllReviews({limit, page,providerId, userId, role});
        if(!result) throw new Error("No reviews found");
     
        return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
    }
}