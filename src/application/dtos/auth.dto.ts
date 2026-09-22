import { PlanName } from "../../domain/enums/plan.enum";
import { ProviderProfileDTO, UserDTO } from "./common.dto";
import { OnboardingStatus, Role } from "../../domain/enums/common.enum";

/**
 * Auth common dtos
 */


/**
 * Auth usecase dtos
 */

// Register
export interface RegisterInput {
    username: UserDTO["username"];
    email: UserDTO["email"];
    password: string;
}
export interface RegisterOutput {
    token: string
}


// OTP Verification
export interface OTPVerificationInput {
    token: string;
    otp: string;
}


// ResendOtp
export interface ResendOtpOutput {
    token: string;
}


// VerifyEmail
export interface VerifyEmailInput {
    email: UserDTO["email"];
}
export interface VerifyEmailOutput {
    token: string;
}


// Login
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
        allowPushNotification: UserDTO["allowPushNotification"];
        hasUsedTrial?: ProviderProfileDTO['hasUsedTrial'];
    }
}


// UpdatePassword
export interface ResetPasswordInput {
    token: string;
    password: string;
}


// GoogleAuthOrchestration
export interface GoogleAuthOrchestrationInput {
    googleId: string;
    email: string;
    name: string;
    image: string | null;
}
export interface GoogleAuthOrchestrationOutput {
    token?: string;
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
        allowPushNotification: UserDTO["allowPushNotification"];
        hasUsedTrial?: ProviderProfileDTO['hasUsedTrial'];
    }
}





/**
 * Auth service dtos
 */

// Base user response
export interface BaseUserResponse {
    uid: UserDTO['_id'];
    username: UserDTO['username'];
    email: UserDTO['email'];
    role: UserDTO['role'];
    onboardingType: UserDTO['onboardingType'];
    onboardingStatus: UserDTO['onboardingStatus'];
    isBlocked: UserDTO['isBlocked'];
    isLoggedIn: boolean;
    phone: UserDTO['phone'];
    profileImage: UserDTO['profileImage'];
    isAddressAdded: boolean;
    allowPushNotification: UserDTO['allowPushNotification'];
}

// Provider prrof status
export interface ProviderProofStatus {
    identityProof: boolean;
    serviceProof: boolean;
}

// Provider ( user with rpvider role ) response
export interface ProviderFieldsResponse {
    isServiceDetailsAdded: boolean;
    isServiceAvailabilityAdded: boolean;
    isProofSubmitted?: ProviderProofStatus;
    isAddressVerified?: ProviderProfileDTO["isAddressVerified"],
    isServiceDetailsVerified?: ProviderProfileDTO["isServiceDetailsVerified"],
    isAvailabilityVerified?: ProviderProfileDTO["isAvailabilityVerified"],
    isProofsVerified?: ProviderProfileDTO["isProofsVerified"],
    isAdminVerified?: ProviderProfileDTO["isAdminVerified"],
    providerSubscription?: string;
    verificationRejectionReason?: ProviderProfileDTO["verificationRejectionReason"],
    adminVerificationStatus?: ProviderProfileDTO["adminVerificationStatus"],
    hasUsedTrial: ProviderProfileDTO['hasUsedTrial'];
}