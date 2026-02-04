import { Review } from "../../entities/review.entity";

export interface IReviewRepository {

    create(review: Review): Promise<Review>;

    update(review: Review): Promise<Review>;

    findById(reviewId: string): Promise<Review | null>;
    
    deleteById(reviewId: string): Promise<boolean>;

}