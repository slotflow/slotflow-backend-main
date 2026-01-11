import mongoose, { Schema, Document, Types } from 'mongoose';
import { AdminVerificationStatus } from '../../domain/enums/adminVerificationStatus.enum';

export interface IProvider extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isBlocked: boolean;
  isEmailVerified: boolean;

  isAdminVerified: boolean;
  verificationRejectionReason: string;

  adminVerificationStatus: AdminVerificationStatus,
  isAddressVerified: boolean,
  isServiceDetailsVerified: boolean,
  isAvailabilityVerified: boolean,
  isProofsVerified: boolean,

  phone: string;
  profileImage: string;
  addressId: Types.ObjectId;
  serviceId: Types.ObjectId;
  serviceAvailabilityId: Types.ObjectId;
  subscription: Types.ObjectId[];
  verificationToken: string;
  googleConnected: boolean;
  googleId: string;
  stripeAccountId: string;
  trustedBySlotflow: boolean;
  identityProof: string;
  serviceProof: string;
  createdAt: Date;
  updatedAt: Date;
};

const ProviderSchema = new Schema<IProvider>({
  username: {
    type: String,
    required: [true, "Username is required"],
    minlength: [4, "Username must be at least 4 characters"],
    maxlength: [30, "Username must be at most 30 characters"],
    trim: true,
    match: [/^[a-zA-Z\s]{4,30}$/, "Invalid username"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email"],
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    minlength: [8, "Password must be at least 8 characters"],
    maxlength: [100, "Password must be at most 100 characters"],
    match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,100}$/, "Invalid password"]
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
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
  phone: {
    type: String,
    default: null,
    minlength: [7, "Phone number must be at least 7 characters"],
    maxlength: [20, "Phone number must be at most 20 characters"],
    match: [/^\+?[0-9\s\-().]{7,20}$/, "Invalid phone number. Only digits, spaces, dashes (-), dots (.), parentheses (), and an optional + at the beginning are allowed. Length must be between 7 to 20 characters."],
  },
  profileImage: {
    type: String,
    default: null
  },
  addressId: {
    type: Schema.Types.ObjectId,
    ref: "Address",
    default: null
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: "Service",
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
  verificationToken: {
    type: String,
    default: null
  },
  googleConnected: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    default: null,
    required: function () {
      return !this.password;
    }
  },
  stripeAccountId: {
    type: String,
    default: null,
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

ProviderSchema.pre("save", function (next) {
  if (!this.password && !this.googleId) {
    return next(new Error("Either password or googleId is required"));
  }
  next();
});

export const ProviderModel = mongoose.model<IProvider>('Provider', ProviderSchema);
