import { Types } from "mongoose";

export class Review {
    constructor(
        public _id: Types.ObjectId,
        public userId: Types.ObjectId,
        public providerId: Types.ObjectId,
        public bookingId: Types.ObjectId,
        public reviewText: string,
        public rating: number,
        public reported: boolean,
        public isBlocked: boolean,
        public createdAt: Date,
        public updatedAt: Date,
    ) { }
}