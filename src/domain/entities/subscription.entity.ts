import { Types } from "mongoose";
import { SubscriptionStatusType } from "../../application/dtos/common.dto";

export class Subscription {
    constructor(
        public _id: Types.ObjectId,
        public providerId: Types.ObjectId,
        public subscriptionPlanId: Types.ObjectId,
        public startDate: Date,
        public endDate: Date,
        public subscriptionStatus: SubscriptionStatusType,
        public paymentId: Types.ObjectId | null,
        public createdAt: Date,
        public updatedAt: Date,
    ) { }
}