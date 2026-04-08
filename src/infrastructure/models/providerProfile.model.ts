import mongoose, { Schema, Document, Types } from 'mongoose';
import { AdminVerificationStatus } from '../../domain/enums/adminVerificationStatus.enum';

export interface IProviderProfile extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    isAdminVerified: boolean;
    verificationRejectionReason: string;
    adminVerificationStatus: AdminVerificationStatus,
    isAddressVerified: boolean,
    isServiceDetailsVerified: boolean,
    isAvailabilityVerified: boolean,
    isProofsVerified: boolean,
    addressId: Types.ObjectId;
    serviceId: Types.ObjectId;
    serviceAvailabilityId: Types.ObjectId;
    subscription: Types.ObjectId[];
    trustedBySlotflow: boolean;
    identityProof: string;
    serviceProof: string;
    createdAt: Date;
    updatedAt: Date;
};

const ProviderProfileSchema = new Schema<IProviderProfile>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isAdminVerified: {
        type: Boolean,
        default: false
    },
    verificationRejectionReason: {
        type: String,
        default: null,
        minlength: [5, "Rejection reason must be at least 5 characters"],
        maxlength: [500, "Rejection reason must be at most 500 characters"],
        trim: true,
        match: [
            /^[A-Za-z0-9\s.,\-_'()@#!?&/:]+$/,
            "Rejection reason contains invalid characters",
        ],
    },
    adminVerificationStatus: {
        type: String,
        enum: Object.values(AdminVerificationStatus),
        default: AdminVerificationStatus.NOT_REQUESTED
    },
    isAddressVerified: {
        type: Boolean,
        default: false
    },
    isServiceDetailsVerified: {
        type: Boolean,
        default: false
    },
    isAvailabilityVerified: {
        type: Boolean,
        default: false
    },
    isProofsVerified: {
        type: Boolean,
        default: false
    },
    addressId: {
        type: Schema.Types.ObjectId,
        ref: "Address",
        default: null
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: "ProviderService",
        default: null
    },
    serviceAvailabilityId: {
        type: Schema.Types.ObjectId,
        ref: "ServiceAvailability",
        default: null
    },
    subscription: {
        type: [Schema.Types.ObjectId],
        ref: "Subscription",
        default: []
    },
    trustedBySlotflow: {
        type: Boolean,
        default: false
    },
    identityProof: {
        type: String,
        default: null
    },
    serviceProof: {
        type: String,
        default: null
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

export const ProviderProfileModel = mongoose.model<IProviderProfile>('ProviderProfile', ProviderProfileSchema);
