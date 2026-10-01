import mongoose, { Schema, Document, Types } from 'mongoose';
import { TimeZone } from '../../domain/commands/user.commands';
import { HearAboutUsOptionValue, OnboardingStatus, Role } from '../../domain/enums/common.enum';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string | null;
  email: string;
  password: string;
  role: Role;
  onboardingType: Role | null;
  onboardingStatus: OnboardingStatus;
  isBlocked: boolean;
  phone: string;
  profileImage: string | null;
  addressId: Types.ObjectId;
  googleConnected: boolean;
  googleId: string;
  whereDidHearAboutUs: HearAboutUsOptionValue;
  referralCode: string | null;
  referredBy: string | null;
  timeZone: TimeZone | null;
  createdAt: Date;
  updatedAt: Date;
};

const TimeZoneSchema = new Schema<TimeZone>(
  {
    value: { type: String, required: true, default: "Asia/Kolkata" },
    label: { type: String, required: true, default: "(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi" },
    offset: { type: Number, required: true, default: 5.5 },
    abbrev: { type: String, required: true, default: "IST" },
    altName: { type: String, required: true, default: "India Standard Time" },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    minlength: [4, "Username must be at least 4 characters"],
    maxlength: [30, "Username must be at most 30 characters"],
    default: null,
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
    required: function (): boolean {
      return !this.googleId;
    },
    minlength: [8, "Password must be at least 8 characters"],
    maxlength: [100, "Password must be at most 100 characters"],
    match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,100}$/, "Invalid password"]
  },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.USER
  },
  onboardingType: {
    type: String,
    enum: Object.values(Role),
    default: null,
  },
  onboardingStatus: {
    type: String,
    enum: Object.values(OnboardingStatus),
    default: OnboardingStatus.NOT_STARTED,
  },
  isBlocked: {
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
  googleConnected: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    default: null,
    required: function (): boolean {
      return !this.password;
    }
  },
  whereDidHearAboutUs: {
    type: String,
    enum: Object.values(HearAboutUsOptionValue),
    default: null
  },
  referralCode: {
    type: String,
    default: null
  },
  referredBy: {
    type: String,
    default: null
  },
  timeZone: {
    type: TimeZoneSchema,
    required: true,
    default: () => ({
      value: "Asia/Kolkata",
      label: "(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi",
      offset: 5.5,
      abbrev: "IST",
      altName: "India Standard Time",
    }),
  }
},
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
