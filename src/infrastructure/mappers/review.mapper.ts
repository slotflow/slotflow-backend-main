import { Types } from "mongoose";
import { IReview } from "../database/review.model";
import { Review } from "../../domain/entities/review.entity";

export class ReviewMapper {

    static toDomain(doc: IReview): Review {
        return new Review({
            _id: doc._id.toString(),
            bookingId: doc.bookingId.toString(),
            providerId: doc.providerId.toString(),
            userId: doc.userId.toString(),
            rating: doc.rating,
            reviewText: doc.reviewText,
            reported: doc.reported,
            isBlocked: doc.isBlocked,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static toPersistence(entity: Review) {
        const props = entity.getProps();

        return {
            bookingId: new Types.ObjectId(props.bookingId),
            providerId: new Types.ObjectId(props.providerId),
            userId: new Types.ObjectId(props.userId),
            rating: props.rating,
            reviewText: props.reviewText,
            reported: props.reported,
            isBlocked: props.isBlocked,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}
