import { CommonResponse } from "./common.dto";
import { Role } from "../../domain/enums/common.enum";
import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";

// user or provider register usecase request payload interface
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}
// user or provider register usecase response interface
export interface RegisterResponse {
    token: string
}


// user or provider OTP Verification usecase request payload interface
export interface OTPVerificationRequest {
    token: string;
    otp: string;
}


// user or provider Resend use case request payload interface
export interface ResendOtpRequest {
    token: string;
}

// user or provider verify email use case request payload interface
export interface VerifyEmailRequest {
    email: string;
}

export interface VerifyEmailResponse {
    token: string;
}

// user or provider login use case request payload interface
export interface LoginRequest {
    email: string;
    password: string;
}
// user or provider login use case response interface
export interface LoginResponse {
    authUser: {
        uid?: string;
        username: string;
        phone?: string;
        profileImage?: string | null;
        role: Role;
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
        googleId?: string;
        googleConnected?: boolean;
        stripeAccountId?: string;
        stripeConnected?: boolean;
        allowPushNotification?: boolean;
    }
}


// user or provider update password use case request payload interface
export interface UpdatePasswordRequest {
    token: string;
    password: string;
}


// check user status use case request payload interface
export interface CheckUserStatusRequest {
    _id: string;
    role: Role;
}
// check user status use case response interface
export interface CheckUserStatusResponse extends CommonResponse {
    status: number;
}


// google auth orchestration use case request payload interface
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

// google auth orchestration use case response interface
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
        allowPushNotification: boolean | null,
    }
}
