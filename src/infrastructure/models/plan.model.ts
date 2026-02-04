import { PlanName } from "../../domain/enums/plan.enum";
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPlan extends Document {
    _id: Types.ObjectId;
    planName: PlanName;
    description: string
    price: number;
    features: string[];
    maxBookingPerMonth: number;
    adVisibility: boolean;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
};

const PlanSchema = new Schema<IPlan>({
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
        unique: true,
        match: [/^[\w\d\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/, "Description contains invalid characters"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        unique: true,
        min: [0, "Price must be at least 0"],
        max: [100000, "Price must be at most 100000"]
    },
    features: {
        type: [String],
        required: [true, "At least one feature is required"],
        validate: {
            validator: (arr: string[]) => arr.every(feature => typeof feature === "string" && feature.trim().length > 0),
            message: "All features must be non-empty strings"
        }
    },
    maxBookingPerMonth: {
        type: Number,
        required: [true, "Max bookings per month is required"],
        min: [0, "Min value is 0"],
        max: [10000, "Max value is 10000"]
    },
    adVisibility: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
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

export const PlanModel = mongoose.model<IPlan>('Plan', PlanSchema)