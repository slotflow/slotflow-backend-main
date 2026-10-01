import mongoose, { Document, Schema, Types } from "mongoose";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  providerId: Types.ObjectId;
  subscribedPlanId: Types.ObjectId;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  subscriptionStatus: SubscriptionStatus;
  cancelAtPeriodEnd: boolean | null;
  cancelAt: Date | null;
  lastEventAt: Date | null;
  paymentId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: [true, "ProviderId is required"],
    },
    subscribedPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: [true, "SubscribedPlanId is required"],
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      required: [true, "SubscriptionStatus is required"],
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    cancelAt: {
      type: Date,
      default: null,
    },
    lastEventAt: {
      type: Date,
      default: null,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const SubscriptionModel = mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);