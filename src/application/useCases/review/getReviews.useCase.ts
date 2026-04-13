import { log } from "../../../shared/logger/logger";
import { IReviewQueries } from "../../queries/IReview.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { GetReviewsRequest, GetReviewsResponse, TableData } from "../../dtos/common.dto";

export class GetReviewsUseCase {
    constructor(
        private reviewQueries: IReviewQueries,
        private signedUrlService: ISignedUrlService
    ) { };

    async execute(payload: GetReviewsRequest): Promise<TableData<Array<GetReviewsResponse>>> {
        try {
            const { limit, page, providerId, role, userId } = payload;

            const result = await this.reviewQueries.findAll({ limit, page, providerId, userId, role });
            if (!result || !result.data) throw new Error("No reviews found");

            const { data: reviews, currentPage, totalCount, totalPages } = result;

            const updatedData = await Promise.all(
                reviews.map(async (review) => {
                    if (review.userId?.profileImage) {
                        const signedUrl = await this.signedUrlService.get(review.userId.profileImage);
                        review.userId.profileImage = signedUrl;
                    }

                    if (review.providerId?.profileImage) {
                        const signedUrl = await this.signedUrlService.get(review.providerId.profileImage);
                        review.providerId.profileImage = signedUrl;
                    }

                    return review;
                }),
            );

            return {
                data: updatedData,
                totalPages,
                currentPage,
                totalCount
            };
        } catch (error) {
            log.error("GetAllReviewsUseCase failed", error as Error);
            throw error;
        };
    };
};