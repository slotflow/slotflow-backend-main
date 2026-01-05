import { CommonResponse } from "./common.dto";
import { Role } from "../../domain/enums/role.enum";
import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";

// **** Register usec case
// user or provider register usecase request payload interface
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role: string;
}
// user or provider register usecase response interface
export interface RegisterResponse {
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
    role: Role;
}

export interface VerifyAndActivateEntityRequest {
    verificationToken: string;
    role: Role;
}


// **** Resend OTP use case
// user or provider Resend use case request payload interface
export interface ResendOtpRequest {
    role: string;
    verificationToken?: string;
    email?: string;
}
export interface ResendOtpResponse {
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
export interface LoginResponse {
    authUser: {
        uid?: string;
        username: string;
        phone?: string;
        profileImage?: string | null;
        role: string;
        token: string;
        isBlocked?: boolean;
        isLoggedIn: boolean;
        isAddressAdded?: boolean;
        isServiceDetailsAdded?: boolean;
        isServiceAvailabilityAdded?: boolean;
        isAdminVerified?: boolean;
        isProofSubmitted?: boolean;
        verificationRejectionReason?: string | null,
        adminVerificationStatus?: AdminVerificationStatus,
        isAddressVerified?: boolean,
        isServiceDetailsVerified?: boolean,
        isAvailabilityVerified?: boolean,
        isProofsVerified?: boolean,
        providerSubscription?: string;
        googleConnected?: boolean;
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
    _id: string;
    role: string;
}
// check user status use case response interface
export interface CheckUserStatusResponse extends CommonResponse {
    status: number;
}


export interface GoogleAuthOrchestrationRequest {
    googleId: string;
    email: string;
    name: string;
    image?: string | null;
    role: Role;
    connectOnly?: boolean;
    userId?: string;
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
}

export interface GoogleAuthOrchestrationResponse {
    token?: string;
    user: {
        _id: string;
        isAddressAdded?: boolean;
        isServiceDetailsAdded?: boolean;
        isServiceAvailabilityAdded?: boolean;
        isAdminVerified?: boolean;
        isProofSubmitted?: boolean;
        verificationRejectionReason?: string | null,
        adminVerificationStatus?: AdminVerificationStatus,
        isAddressVerified?: boolean,
        isServiceDetailsVerified?: boolean,
        isAvailabilityVerified?: boolean,
        isProofsVerified?: boolean,
        providerSubscription?: string;
    }
}
