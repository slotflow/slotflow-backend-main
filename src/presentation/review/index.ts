import { signedUrlService } from "../../infrastructure/services";
import { reviewQueries } from "../../infrastructure/queriesImpls";
import { reviewRepository } from "../../infrastructure/repositoryImpls";
import { GetReviewsUseCase } from "../../application/useCases/review/getReviews.useCase";
import { ReportReviewUseCase } from "../../application/useCases/review/reportReview.useCase";
import { DeleteReviewUseCase } from "../../application/useCases/review/deleteReview.useCase";
import { CreateReviewUseCase } from "../../application/useCases/review/createReview.useCase";
import { ToggleReviewBlockStatusUseCase } from "../../application/useCases/review/toggleReviewBlockStatus.useCase";

export const getReviewsUseCase = new GetReviewsUseCase(reviewQueries, signedUrlService);

export const createReviewUseCase = new CreateReviewUseCase(reviewRepository);

export const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository);

export const reportReviewUseCase = new ReportReviewUseCase(reviewRepository);

export const toggleReviewBlockStatusUseCase = new ToggleReviewBlockStatusUseCase(reviewRepository);