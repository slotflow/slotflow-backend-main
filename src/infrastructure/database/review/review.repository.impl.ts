import { Types } from "mongoose";
import { ReviewModel } from "./review.model";
import { ReviewMapper } from "../../mappers/review.mapper";
import { Review } from "../../../domain/entities/review.entity";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReview.repository";

export class ReviewRepositoryImpl implements IReviewRepository {

    async create(review: Review): Promise<Review> {
        const persistence = ReviewMapper.toPersistence(review);
        const created = await ReviewModel.create(persistence);
        return ReviewMapper.toDomain(created);
    };

    async deleteById(reviewId: string): Promise<boolean> {
        const doc = await ReviewModel.findByIdAndDelete(new Types.ObjectId(reviewId));
        return !!doc;
    };

    async findById(reviewId: string): Promise<Review | null> {
        const doc = await ReviewModel.findById(new Types.ObjectId(reviewId));
        return doc ? ReviewMapper.toDomain(doc) : null;
    };

    async update(review: Review): Promise<Review> {
        const persistence = ReviewMapper.toPersistence(review);

        const updated = await ReviewModel.findByIdAndUpdate(
            new Types.ObjectId(review._id),
            persistence,
            { new: true }
        );

        if (!updated) {
            throw new Error("Review not found");
        };

        return ReviewMapper.toDomain(updated);
    };
}