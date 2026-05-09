import { TableData } from "../../dtos/common.dto";
import { IReviewQueries } from "../../queries/IReview.queries";
import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetReviewsInput, GetReviewsOutput } from "../../dtos/review.dto";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";

export class GetReviewsUseCase {
    constructor(
        private readonly reviewQueries: IReviewQueries,
        private readonly signedUrlService: ISignedUrlService
    ) { };

    async execute(input: GetReviewsInput): Promise<TableData<GetReviewsOutput> | null> {
        try {
            const { limit, page, providerId, role, userId } = input;
            if (!userId && !providerId && !role) {
                throw new BadRequestError();
            }

            const result = await this.reviewQueries.findAll({ limit, page, providerId, userId, role });

            const { items: reviews, currentPage, totalCount, totalPages } = result;
            if (!reviews) {
                return null;
            }

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
                items: updatedData,
                totalPages,
                currentPage,
                totalCount
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get reviews");
        };
    };
};