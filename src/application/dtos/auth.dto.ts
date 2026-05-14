import { OnboardingStatus, Role } from "../../domain/enums/common.enum";
import { ProviderProfileDTO, UserDTO } from "./common.dto";

//// **** auth dtos **** ////

// Register usecase input output
export interface RegisterInput {
    username: UserDTO["username"];
    email: UserDTO["email"];
    password: string;
}

export interface RegisterOutput {
    token: string
}


// OTP Verification usecase input
export interface OTPVerificationInput {
    token: string;
    otp: string;
}


// ResendOtp usecase output
export interface ResendOtpOutput {
    token: string;
}

// VerifyEmail usecase input output
export interface VerifyEmailInput {
    email: UserDTO["email"];
}
export interface VerifyEmailOutput {
    token: string;
}

// Login usecase input output
export interface LoginInput {
    email: UserDTO["email"];
    password: string;
}
export interface LoginOutput {
    token: string;
    user: {
        uid: UserDTO["_id"];
        username: UserDTO["username"];
        email: UserDTO["email"];
        role: UserDTO["role"];
        onboardingType: Role | null;
        onboardingStatus: OnboardingStatus;
        isBlocked: UserDTO["isBlocked"];
        isLoggedIn: boolean;
        phone: UserDTO["phone"];
        profileImage: UserDTO["profileImage"];
        isAddressAdded: boolean;

        isServiceDetailsAdded?: boolean;
        isServiceAvailabilityAdded?: boolean;
        isProofSubmitted?: {
            identityProof: boolean;
            serviceProof: boolean;
        };
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


// UpdatePassword usecase output
export interface ResetPasswordInput {
    token: string;
    password: string;
}


// GoogleAuthOrchestration usecase input output
export interface GoogleAuthOrchestrationInput {
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
export interface GoogleAuthOrchestrationOutput {
    token?: string;
    user: {
        googleId: string;
        googleConnected: boolean;
    } | {
        uid: UserDTO["_id"];
        username: UserDTO["username"];
        email: UserDTO["email"];
        role: UserDTO["role"];
        onboardingType: Role | null;
        onboardingStatus: OnboardingStatus;
        isBlocked: UserDTO["isBlocked"];
        isLoggedIn: boolean;
        phone: UserDTO["phone"];
        profileImage: UserDTO["profileImage"];
        isAddressAdded: boolean;

        isServiceDetailsAdded?: boolean;
        isServiceAvailabilityAdded?: boolean;
        isProofSubmitted?: {
            identityProof: boolean;
            serviceProof: boolean;
        };
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
