import mongoose, { Document, Schema, Types } from "mongoose";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";

export interface ISubscription extends Document {
    _id: Types.ObjectId,
    providerId: Types.ObjectId,
    subscriptionPlanId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
    subscriptionStatus: SubscriptionStatus,
    paymentId: Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
};

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
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    subscriptionStatus: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        required: [true, "SubscriptionStatus is required"]
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        default: null,
    },
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date,
        required: true
    }
});

export const SubscriptionModel = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);