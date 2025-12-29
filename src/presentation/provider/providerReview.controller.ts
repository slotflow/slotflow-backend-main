import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/role.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { fetchAllReviewsUseCase, providerChangeReviewRepostStatusUseCase } from ".";
import { FetchAllReviewsUseCase } from "../../application/useCases/common/fetchReviews.useCase";
import { ProviderChangeReviewRepostStatusUseCase } from "../../application/useCases/provier/providerReview.useCase";

class ProviderReviewController {
    constructor(
        private fetchAllReviewsUseCase: FetchAllReviewsUseCase,
        private providerChangeReviewRepostStatusUseCase: ProviderChangeReviewRepostStatusUseCase,
    ) {
        this.findAllReviews = this.findAllReviews.bind(this);
        this.chnageReportReview = this.chnageReportReview.bind(this);
    };

    async findAllReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { limit, page } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.fetchAllReviewsUseCase.execute({
                page,
                limit,
                providerId,
                role: Role.Provider
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("findAllReviews failed", error as Error);
            next(error);
        };
    };

    async chnageReportReview(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const reviewId = req.params.reviewId;
            const result = await this.providerChangeReviewRepostStatusUseCase.execute({
                reviewId,
                providerId
            });
            sendResponse(res, result, `Review ${result ? "reported" : "unreported"} successfully`);
        } catch (error) {
            log.error("reportReview failed", error as Error);
            next(error);
        };
    };

};

export const providerReviewController = new ProviderReviewController(
    fetchAllReviewsUseCase,
    providerChangeReviewRepostStatusUseCase
);
