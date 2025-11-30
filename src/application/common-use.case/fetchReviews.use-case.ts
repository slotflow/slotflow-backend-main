import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { ReviewRepositoryImpl } from "../../infrastructure/database/review/review.repository.impl";
import { ApiResponse, FetchReviesRequest, FetchReviewsResponse } from "../../infrastructure/dtos/common.dto";


export class FetchAllReviewsUseCase {
    constructor(
        private reviewRepositoryImpl: ReviewRepositoryImpl,
        private generateSignedUrlService: GenerateSignedUrlService
    ) { }

    async execute(payload: FetchReviesRequest): Promise<ApiResponse<FetchReviewsResponse[]>> {
        try {
            const { limit, page, providerId, role, userId } = payload;

            const result = await this.reviewRepositoryImpl.findAllReviews({ limit, page, providerId, userId, role });
            if (!result || !result.data) throw new Error("No reviews found");

            const updatedData = await Promise.all(
                result.data.map(async (review) => {
                    if (review.userId?.profileImage) {
                        const signedUrl = await this.generateSignedUrlService.execute(review.userId.profileImage);
                        if (!signedUrl) throw new Error("Image fetching error.");
                        review.userId.profileImage = signedUrl;
                    }

                    if (review.providerId?.profileImage) {
                        const signedUrl = await this.generateSignedUrlService.execute(review.providerId.profileImage);
                        if (!signedUrl) throw new Error("Image fetching error.");
                        review.providerId.profileImage = signedUrl;
                    }

                    return review;
                })
            );

            return { data: updatedData, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("FetchAllReviewsUseCase error : ", error);
            throw new Error("Failed to Fetch all reviews");
        }
    }
}