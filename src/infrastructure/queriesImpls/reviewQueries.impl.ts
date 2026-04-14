import { FilterQuery } from "mongoose";
import { ReviewModel } from "../models/review.model";
import { Role } from "../../domain/enums/common.enum";
import { Review } from "../../domain/entities/review.entity";
import { ReviewDTO, TableData } from "../../application/dtos/common.dto";
import { IReviewQueries } from "../../application/queries/IReview.queries";
import { GetReviewsQuery, GetReviewsView } from "../../application/dtos/review.dtos";

export class ReviewQueriesImpl implements IReviewQueries {

    async findAll(query: GetReviewsQuery): Promise<TableData<Array<GetReviewsView>>> {
        const { limit, page, providerId, userId, role } = query;

        const skip = (page - 1) * limit;

        const filter: FilterQuery<ReviewDTO> = {};

        if (role === Role.USER && userId) {
            filter.userId = userId;
        } else if (role === Role.PROVIDER && providerId) {
            filter.providerId = providerId;
        } else if (role === Role.USER && providerId) {
            filter.providerId = providerId;
            filter.isBlocked = false;
        } else if(role === Role.ADMIN && userId) {
            filter.userId = userId;
        } else if(role === Role.ADMIN && providerId) {
            filter.providerId = providerId;
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
                .skip(skip).limit(limit).sort({ createdAt: 1 }).lean<GetReviewsView[]>(),
            ReviewModel.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: reviews.map((r) => ({
                _id: r._id.toString(),
                reviewText: r.reviewText,
                rating: r.rating,
                createdAt: r.createdAt,
                reported: r.reported,
                isBlocked: r.isBlocked,
                userId: {
                    username: r.userId.username,
                    profileImage: r.userId.profileImage,
                },
                providerId: {
                    username: r.providerId.username,
                    profileImage: r.providerId.profileImage,
                },
            })),
            totalPages,
            currentPage: page,
            totalCount
        }
    };

};