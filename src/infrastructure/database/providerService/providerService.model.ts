import mongoose, { Document, Schema, Types } from "mongoose";
import { ServiceType } from "../../../domain/enums/serviceType.enum";
import { ServiceMode } from "../../../domain/enums/serviceMode.enum";
import { serviceNameRegex, serviceExperienceRegex, serviceDescriptionRegex } from "../../../shared/zod/regex";

export interface IProviderService extends Document {
  _id: Types.ObjectId;
  providerId: Types.ObjectId;
  service: Types.ObjectId;
  serviceName: string;
  serviceDescription: string;
  servicePrice: number;
  serviceExperience: string;
  serviceType: ServiceType;
  serviceMode: ServiceMode;
  tags: string[] | [];
  maxParticipants: number;
  isGroupService: boolean;
  requirements: string | null;
  videoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderServiceSchema = new Schema<IProviderService>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: [true, "Provider ID is required"],
    },

    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service is required"],
    },

    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      minlength: [4, "Service name must be at least 4 characters long"],
      maxlength: [50, "Service name must be at most 50 characters long"],
      match: [
        serviceNameRegex,
        "Invalid service name. Only alphabets and spaces allowed.",
      ],
    },

    serviceDescription: {
      type: String,
      required: [true, "Service description is required"],
      minlength: [10, "Service description must be at least 10 characters long"],
      maxlength: [
        500,
        "Service description must be at most 500 characters long",
      ],
      match: [serviceDescriptionRegex, "Invalid service description format"],
    },

    servicePrice: {
      type: Number,
      required: [true, "Service price is required"],
      min: [1, "Invalid service price"],
      max: [1_000_000, "Invalid service price"],
    },

    serviceExperience: {
      type: String,
      required: [true, "Experience is required"],
      minlength: [1, "Experience must be at least 1 character"],
      maxlength: [500, "Experience cannot exceed 500 characters"],
      match: [serviceExperienceRegex, "Invalid experience format"],
    },

    serviceType: {
      type: String,
      enum: Object.values(ServiceType),
      required: [true, "Service type is required"],
    },

    serviceMode: {
      type: String,
      enum: Object.values(ServiceMode),
      required: [true, "Service mode is required"],
    },

    tags: {
      type: [String],
      default: [],
    },

    maxParticipants: {
      type: Number,
      min: [1, "Minimum 1 participant required"],
      max: [500, "Cannot exceed 500 participants"],
    },

    isGroupService: {
      type: Boolean,
      default: false,
    },

    requirements: {
      type: String,
      maxlength: [500, "Requirements cannot exceed 500 characters"],
      default: null
    },

    videoUrl: {
      type: String,
      match: [/^https?:\/\/.+/, "Invalid video URL format"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ProviderServiceModel = mongoose.model<IProviderService>("ProviderService", ProviderServiceSchema);
