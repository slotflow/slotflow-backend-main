import { Role } from '../../domain/enums/common.enum';
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: Role;
  hasSelectedRole: boolean;
  isBlocked: boolean;
  phone: string;
  profileImage: string | null;
  addressId: Types.ObjectId;
  googleConnected: boolean;
  googleId: string;
  stripeConnected: boolean;
  stripeAccountId: string | null;
  stripeCustomerId: string | null;
  allowPushNotification: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<IUser>({
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
  hasSelectedRole: {
    type: Boolean,
    default: false
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
  stripeConnected: {
    type: Boolean,
    default: false
  },
  stripeAccountId: {
    type: String,
    default: null
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  allowPushNotification: {
    type: Boolean,
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

export const UserModel = mongoose.model<IUser>('User', UserSchema);
