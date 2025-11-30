import { Types } from "mongoose";
import { ApiResponse, CommonResponse, RoleType } from "./common.dto";

// **** Register usec case
// user or provider register usecase request payload interface
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role: string;
}
// user or provider register usecase response interface
export interface RegisterResponse extends CommonResponse {
    authUser: {
        verificationToken: string,
        role: string,
        token: string
    }
}


// **** OTP Verification use case
// user or provider OTP Verification usecase request payload interface
export interface OTPVerificationRequest {
    otp: string;
    verificationToken: string;
    role: string;
}


// **** Resend OTP use case
// user or provider Resend use case request payload interface
export interface ResendOtpRequest {
    role: string;
    verificationToken?: string;
    email?: string;
}
export interface ResendOtpResponse extends ApiResponse {
  authUser: {
    verificationToken: string,
    role: string
  }
}


// **** Login use case
// user or provider login use case request payload interface
export interface LoginRequest {
    email: string;
    password: string;
    role: string;
}
// user or provider login use case response interface
export interface LoginResponse extends CommonResponse {
    authUser: {
        uid?: Types.ObjectId;
        username: string,
        profileImage: string | null,
        role: string,
        token: string,
        isBlocked?: boolean;
        isLoggedIn: boolean,
        isAddressAdded?: boolean,
        isServiceDetailsAdded?: boolean,
        isServiceAvailabilityAdded?: boolean,
        isAdminApproved?: boolean
        providerSubscription?: string;
        googleConnected?: boolean;
        updatedAt?: Date;
    }
}


// **** Update password use case
// user or provider update password use case request payload interface
export interface UpdatePasswordRequest {
    role: string;
    verificationToken: string;
    password: string;
}


// **** Check status
// check user status use case request payload interface
export interface CheckUserStatusRequest {
    _id: Types.ObjectId;
    role: string;
}
// check user status use case response interface
export interface CheckUserStatusResponse extends CommonResponse {
    status: number;
}


// **** Google Auth
export interface GoogleAuthRequest {
    googleId: string;
    email: string;
    name: string;
    role: RoleType;
    image: string | null;
}
