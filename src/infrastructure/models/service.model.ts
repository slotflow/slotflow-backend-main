import mongoose, { Document, Schema, Types } from "mongoose";
import { ServiceCategory } from "../../domain/enums/service.enum";

export interface IService extends Document {
    _id: Types.ObjectId;
    serviceName: string;
    serviceCategory: ServiceCategory;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
};

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
        enum: Object.values(ServiceCategory),
        required: true,
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

export const ServiceModel = mongoose.model<IService>('Service', serviceSchema);