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
    token: string;
    user: {
        uid: string;
        username: string;
        email: string;
        role: Role;
        hasSelectedRole: boolean;
        isOnboardingCompleted: boolean;
        isBlocked: boolean;
        isLoggedIn: boolean;
        phone: string | null;
        profileImage: string | null;
        isAddressAdded: boolean;

        isServiceDetailsAdded?: boolean;
        isServiceAvailabilityAdded?: boolean;
        isProofSubmitted?: boolean;
        isAddressVerified?: boolean,
        isServiceDetailsVerified?: boolean,
        isAvailabilityVerified?: boolean,
        isProofsVerified?: boolean,
        isAdminVerified?: boolean;
        providerSubscription?: string;
        verificationRejectionReason?: string | null,
        adminVerificationStatus?: AdminVerificationStatus,

        googleId: string | null;
        googleConnected: boolean;
        stripeConnected: boolean;
        stripeAccountId: string | null;
        stripeCustomerId: string | null;
        allowPushNotification: boolean;
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
    image: string | null;
    role: Role;
    connectOnly: boolean;
    userId: string | null;
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
}

// google auth orchestration use case response interface
export interface GoogleAuthOrchestrationResponse {
    token?: string;
    user: {
        googleId: string;
        googleConnected: boolean;
    } | {
        uid: string;
        username: string;
        email: string;
        role: Role;
        hasSelectedRole: boolean;
        isOnboardingCompleted: boolean;
        isBlocked: boolean;
        isLoggedIn: boolean;
        phone: string | null;
        profileImage: string | null;
        isAddressAdded: boolean;

        isServiceDetailsAdded: boolean;
        isServiceAvailabilityAdded: boolean;
        isProofSubmitted: boolean;
        isAddressVerified: boolean,
        isServiceDetailsVerified: boolean,
        isAvailabilityVerified: boolean,
        isProofsVerified: boolean,
        isAdminVerified: boolean;
        providerSubscription: string;
        verificationRejectionReason: string | null,
        adminVerificationStatus: AdminVerificationStatus,
        
        googleId: string;
        googleConnected: boolean;
        stripeConnected: boolean;
        stripeAccountId: string | null;
        stripeCustomerId: string | null;
        allowPushNotification: boolean;
    }
}
