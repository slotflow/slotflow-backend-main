import mongoose, { Document, Schema, Types } from "mongoose";
import { SubscriptionStatusType } from "../../../application/dtos/common.dto";
import { subscriptionStatusArray } from "../../../shared/utils/constants";

export interface ISubscription extends Document {
    _id: Types.ObjectId,
    providerId: Types.ObjectId,
    subscriptionPlanId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
    subscriptionStatus: SubscriptionStatusType,
    paymentId: Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
}

const SubscriptionSchema = new Schema<ISubscription>({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Provider",
        required: [true, "ProviderId is required"]
    },
    subscriptionPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: [true, "SubscriptionPlanId is required"]
    },
    startDate: {
        type: Date,
        required: [true, "StartDate is required"]
    },
    endDate: {
        type: Date,
        required: [true, "EndDate is required"]
    },
    subscriptionStatus: {
        type: String,
        enum: Object.values(subscriptionStatusArray),
        required: [true, "SubscriptionStatus is required"]
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment"
    },
}, {
    timestamps: true
});

export const SubscriptionModel = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);