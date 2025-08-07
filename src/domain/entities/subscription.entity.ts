import { Types } from "mongoose";

export enum SubscriptionStatus {
    Active = "Active",
    Expired = "Expired",
    Cancelled = "Cancelled",
}

export class Subscription {
    constructor(
        public _id: Types.ObjectId,
        public providerId: Types.ObjectId,
        public subscriptionPlanId: Types.ObjectId,
        public startDate: Date,
        public endDate: Date,
        public subscriptionStatus: SubscriptionStatus,
        public paymentId: Types.ObjectId | null,
        public createdAt: Date,
        public updatedAt: Date,
    ) { }
}