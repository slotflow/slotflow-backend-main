import mongoose, { Document, Schema, Types } from "mongoose";
import { StripePlanDetails } from "../../domain/commands/plan.commands";
import { PlanName, StripeSyncStatus } from "../../domain/enums/plan.enum";

export interface IPlan extends Document {
  _id: Types.ObjectId;
  planName: PlanName;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  maxBookingPerMonth: number;
  adVisibility: boolean;
  isBlocked: boolean;
  stripePlanDetails: StripePlanDetails;
  stripeSync: StripeSyncStatus;
  hasTrial: boolean;
  trialDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    planName: {
      type: String,
      enum: Object.values(PlanName),
      required: [true, "Plan name is required"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [200, "Description must be at most 200 characters"],
      match: [
        /^[\w\d\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/,
        "Description contains invalid characters",
      ],
    },
    monthlyPrice: {
      type: Number,
      required: [true, "Monthly price is required"],
      unique: true,
      min: [0, "Monthly price must be at least 0"],
      max: [100000, "Monthly price must be at most 100000"],
    },
    yearlyPrice: {
      type: Number,
      required: [true, "Yearly price is required"],
      unique: true,
      min: [0, "Yearly price must be at least 0"],
      max: [100000, "Yearly price must be at most 100000"],
    },
    features: {
      type: [String],
      required: [true, "At least one feature is required"],
      validate: [
        {
          validator: (arr: string[]) => arr.length <= 15,
          message: "A maximum of 10 features are allowed",
        },
        {
          validator: (arr: string[]) =>
            arr.every((feature) => typeof feature === "string" && feature.trim().length > 0),
          message: "All features must be non-empty strings",
        },
      ],
    },
    maxBookingPerMonth: {
      type: Number,
      required: [true, "Max bookings per month is required"],
      min: [0, "Min value is 0"],
      max: [10000, "Max value is 10000"],
    },
    adVisibility: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    stripePlanDetails: {
      type: {
        productId: {
          type: String,
          required: true,
        },
        monthlyPriceId: {
          type: String,
          required: true,
        },
        yearlyPriceId: {
          type: String,
          required: true,
        },
      },
      default: null,
    },
    stripeSync: {
      type: String,
      enum: Object.values(StripeSyncStatus),
      required: [true, "Stripe sync status is required"],
    },
    hasTrial: {
      type: Boolean,
      required: true,
    },
    trialDays: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const PlanModel = mongoose.model<IPlan>("Plan", PlanSchema);
