import { ServiceCategoryType } from "../../dtos/common.dto";
import mongoose, { Document, Schema, Types } from "mongoose";
import { serviceCategoryArray } from "../../../shared/utils/constants";

export interface IService extends Document {
    _id: Types.ObjectId;
    serviceName: string;
    serviceCategory: ServiceCategoryType;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const serviceSchema = new Schema<IService>({
    serviceName: {
        type: String,
        required: [true, "Service name is required"],
        minlength: [4, "Service name must be at least 4 characters long"],
        maxlength: [50, "Service name must be at most 50 characters long"],
        trim: true,
        match: [/^[A-Za-z0-9 ]{4,50}$/, "Service name can only contain letters, numbers, and spaces"]
    },
    serviceCategory: {
        type: String,
        enum: Object.values(serviceCategoryArray),
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const ServiceModel = mongoose.model<IService>('Service', serviceSchema);