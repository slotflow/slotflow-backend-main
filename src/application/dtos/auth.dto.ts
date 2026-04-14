import { Role } from "../../domain/enums/common.enum";
import { CommonOutput, ProviderProfileDTO, UserDTO } from "./common.dto";

// user or provider register usecase request payload interface
export interface RegisterRequest {
    username: UserDTO["username"];
    email: UserDTO["email"];
    password: UserDTO["password"];
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
    email: UserDTO["email"];
}

export interface VerifyEmailResponse {
    token: string;
}

// user or provider login use case request payload interface
export interface LoginRequest {
    email: UserDTO["email"];
    password: UserDTO["password"];
}
// user or provider login use case response interface
export interface LoginResponse {
    token: string;
    user: {
        uid: UserDTO["_id"];
        username: UserDTO["username"];
        email: UserDTO["email"];
        role: UserDTO["role"];
        hasSelectedRole: UserDTO["hasSelectedRole"];
        isOnboardingCompleted: UserDTO["isOnboardingCompleted"];
        isBlocked: UserDTO["isBlocked"];
        isLoggedIn: boolean;
        phone: UserDTO["phone"];
        profileImage: UserDTO["profileImage"];
        isAddressAdded: boolean;

        isServiceDetailsAdded?: boolean;
        isServiceAvailabilityAdded?: boolean;
        isProofSubmitted?: boolean;
        isAddressVerified?: ProviderProfileDTO["isAddressVerified"],
        isServiceDetailsVerified?: ProviderProfileDTO["isServiceDetailsVerified"],
        isAvailabilityVerified?: ProviderProfileDTO["isAvailabilityVerified"],
        isProofsVerified?: ProviderProfileDTO["isProofsVerified"],
        isAdminVerified?: ProviderProfileDTO["isAdminVerified"],
        providerSubscription?: string;
        verificationRejectionReason?: ProviderProfileDTO["verificationRejectionReason"],
        adminVerificationStatus?: ProviderProfileDTO["adminVerificationStatus"],

        googleId: UserDTO["googleId"];
        googleConnected: UserDTO["googleConnected"];
        stripeConnected: UserDTO["stripeConnected"];
        stripeAccountId: UserDTO["stripeAccountId"];
        stripeCustomerId: UserDTO["stripeCustomerId"];
        allowPushNotification: UserDTO["allowPushNotification"];
    }
}


// user or provider update password use case request payload interface
export interface UpdatePasswordRequest {
    token: string;
    password: UserDTO["password"];
}


// check user status use case request payload interface
export interface CheckUserStatusRequest {
    _id: UserDTO["_id"];
    role: Role;
}
// check user status use case response interface
export interface CheckUserStatusResponse extends CommonOutput {
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
        uid: UserDTO["_id"];
        username: UserDTO["username"];
        email: UserDTO["email"];
        role: UserDTO["role"];
        hasSelectedRole: UserDTO["hasSelectedRole"];
        isOnboardingCompleted: UserDTO["isOnboardingCompleted"];
        isBlocked: UserDTO["isBlocked"];
        isLoggedIn: boolean;
        phone: UserDTO["phone"];
        profileImage: UserDTO["profileImage"];
        isAddressAdded: boolean;

        isServiceDetailsAdded: boolean;
        isServiceAvailabilityAdded: boolean;
        isProofSubmitted: boolean;
        isAddressVerified: ProviderProfileDTO["isAddressVerified"],
        isServiceDetailsVerified: ProviderProfileDTO["isServiceDetailsVerified"],
        isAvailabilityVerified: ProviderProfileDTO["isAvailabilityVerified"],
        isProofsVerified: ProviderProfileDTO["isProofsVerified"],
        isAdminVerified: ProviderProfileDTO["isAdminVerified"],
        providerSubscription: string;
        verificationRejectionReason: ProviderProfileDTO["verificationRejectionReason"],
        adminVerificationStatus: ProviderProfileDTO["adminVerificationStatus"],

        googleId: UserDTO["googleId"];
        googleConnected: UserDTO["googleConnected"];
        stripeConnected: UserDTO["stripeConnected"];
        stripeAccountId: UserDTO["stripeAccountId"];
        stripeCustomerId: UserDTO["stripeCustomerId"];
        allowPushNotification: UserDTO["allowPushNotification"];
    }
}
