import { ReviewModel } from "../models/review.model";
import { ReviewMapper } from "../mappers/review.mapper";
import { Review } from "../../domain/entities/review.entity";
import { IReviewRepository } from "../../domain/interfaces/repositories/IReview.repository";

export class ReviewRepositoryImpl implements IReviewRepository {

    async create(review: Review): Promise<Review | null> {
        const persistence = ReviewMapper.toPersistence(review);
        const doc = await ReviewModel.create(persistence);
        return doc ? ReviewMapper.toDomain(doc) : null;
    };

    async deleteById(reviewId: string): Promise<boolean> {
        const doc = await ReviewModel.findByIdAndDelete(reviewId);
        return !!doc;
    };

    async findById(reviewId: string): Promise<Review | null> {
        const doc = await ReviewModel.findById(reviewId);
        return doc ? ReviewMapper.toDomain(doc) : null;
    };

    async update(review: Review): Promise<Review | null> {
        const persistence = ReviewMapper.toPersistence(review);

        const doc = await ReviewModel.findByIdAndUpdate(
            review._id,
            { $set: persistence },
            { new: true }
        );

        return doc ? ReviewMapper.toDomain(doc) : null;
    };

};