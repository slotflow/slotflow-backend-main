import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";
import { ApiResponse, FetchReviesRequest, FetchReviewsResponse } from "../../dtos/common.dto";


export class FetchAllReviewsUseCase {
    constructor(
        private reviewRepository: IReviewRepository,
        private signedUrlService: ISignedUrlService
    ) { }

    async execute(payload: FetchReviesRequest): Promise<ApiResponse<FetchReviewsResponse[]>> {
        try {
            const { limit, page, providerId, role, userId } = payload;

            const result = await this.reviewRepository.findAllReviews({ limit, page, providerId, userId, role });
            if (!result || !result.data) throw new Error("No reviews found");

            const updatedData = await Promise.all(
                result.data.map(async (review) => {
                    if (review.userId?.profileImage) {
                        const signedUrl = await this.signedUrlService.generate(review.userId.profileImage);
                        if (!signedUrl) throw new Error("Image fetching error.");
                        review.userId.profileImage = signedUrl;
                    }

                    if (review.providerId?.profileImage) {
                        const signedUrl = await this.signedUrlService.generate(review.providerId.profileImage);
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