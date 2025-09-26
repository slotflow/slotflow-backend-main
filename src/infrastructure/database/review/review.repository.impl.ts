import { FilterQuery, Types } from "mongoose";
import { IReview, ReviewModel } from "./review.model";
import { CreateReviewRequset } from "../../dtos/user.dto";
import { Review } from "../../../domain/entities/review.entity";
import { IReviewRepository } from "../../../domain/repositories/IReview.repository";
import { ApiResponse, FetchReviesRequest, FetchReviewsResponse, Role } from "../../dtos/common.dto";

export class ReviewRepositoryImpl implements IReviewRepository {
    public mapToEntity(review: IReview): Review {
        return new Review(
            review._id,
            review.userId,
            review.providerId,
            review.bookingId,
            review.reviewText,
            review.rating,
            review.reported,
            review.isBlocked,
            review.createdAt,
            review.updatedAt,
        )
    }

    async createReview(data: CreateReviewRequset): Promise<Review | null> {
        try {

            const createdReview = await ReviewModel.create(data);
            return createdReview ? this.mapToEntity(createdReview) : null;
        } catch (error) {
            console.log("Review creating error : ", error);
            throw new Error("Review creating failed");
        }
    }


    async findAllReviews(data: FetchReviesRequest): Promise<ApiResponse<FetchReviewsResponse[]>> {
        try {

            const { limit, page, providerId, userId, role } = data;

            const skip = (page - 1) * limit;

            const filter: FilterQuery<typeof Review> = {};

            if (role === Role.user && userId) {
                filter.userId = userId;
            } else if (role === Role.provider && providerId) {
                filter.providerId = providerId;
            } else if(role === Role.user && providerId) {
                filter.providerId = providerId;
                filter.isBlocked = false;
            }

            const [reviews, totalCount] = await Promise.all([
                ReviewModel.find(filter, {
                    _id: 1,
                    reviewText: 1,
                    rating: 1,
                    createdAt: 1,
                    providerId: 1,
                    reported: 1,
                    isBlocked: 1,
                    userId: 1,
                })
                    .populate({
                        path: "userId",
                        select: "username profileImage",
                    })
                    .populate({
                        path: "providerId",
                        select: "username profileImage",
                    })
                    .skip(skip).limit(limit).sort({ createdAt: 1 }).lean<FetchReviewsResponse[]>(),
                ReviewModel.countDocuments(filter),
            ]);

            const totalPages = Math.ceil(totalCount / limit);

            const mappedReviews: FetchReviewsResponse[] = reviews.map((r) => ({
                _id: r._id,
                reviewText: r.reviewText,
                rating: r.rating,
                createdAt: r.createdAt,
                reported: r.reported,
                isBlocked: r.isBlocked,
                userId: {
                    username: r.userId?.username ?? "",
                    profileImage: r.userId.profileImage,
                },
                providerId: {
                    username: r.providerId.username,
                    profileImage: r.providerId.profileImage,
                },
            }));

            return {
                data: mappedReviews,
                totalPages,
                currentPage: page,
                totalCount
            }
        } catch (error) {
            console.log("findAllReviews error : ", error);
            throw new Error("Fetching reviews failed");
        }
    }

    async deleteReview(reviewId: Types.ObjectId): Promise<boolean> {
        try {
            const result = await ReviewModel.findByIdAndDelete(reviewId);
            return result ? true : false;
        } catch (error) {
            console.log("deleteReview error : ", error);
            throw new Error("Deleting review failed");
        }
    }

    async findReviewById(reviewId: Types.ObjectId): Promise<Review | null> {
        try {
            const review = await ReviewModel.findById(reviewId);
            return review || null;
        } catch (error) {
            console.log("findReviewById error : ", error);
            throw new Error("Finding review failed");
        }
    }

    async updateReview(review: Review): Promise<Review | null> {
        try {
            const updatedReview = await ReviewModel.findByIdAndUpdate(
                review._id,
                { ...review },
                { new: true }
            );
            return updatedReview ? this.mapToEntity(updatedReview) : null;
        } catch (error) {
            console.log("updateReview error : ",error);
            throw new Error("Updating review error");
        }
    }
}