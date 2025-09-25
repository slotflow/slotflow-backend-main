import { Validator } from "../../infrastructure/validator/validator";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { ApiResponse, FetchReviesRequest, FetchReviewsResponse } from "../../infrastructure/dtos/common.dto";
import { generateSignedUrl } from "../../infrastructure/services/signedUrl.service";


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
        if(!result || !result.data) throw new Error("No reviews found");

         const updatedData = await Promise.all(
            result.data.map(async (review) => {
                if (review.userId?.profileImage) {
                    const signedUrl = await generateSignedUrl(review.userId.profileImage);
                    if (!signedUrl) throw new Error("Image fetching error.");
                    review.userId.profileImage = signedUrl;
                }

                if (review.providerId?.profileImage) {
                    const signedUrl = await generateSignedUrl(review.providerId.profileImage);
                    if (!signedUrl) throw new Error("Image fetching error.");
                    review.providerId.profileImage = signedUrl;
                }

                return review;
            })
        );
     
        return { data: updatedData, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
    }
}