import { UserProps } from "../../domain/contracts/user.contract";
import { ProviderProfileProps } from "../../domain/contracts/providerProfile.contract";
import { TimeZone } from "../../domain/commands/user.commands";
import { AuthTokens } from "./common.dto";

/**
 * Auth usecase dtos
 */

// Register
export type RegisterInput = Pick<UserProps, "email" | "password" | "timeZone">;
export interface RegisterOutput {
  registrationId: string;
}

// Pending registration
export interface PendingRegistration {
  email: string;
  passwordHash: string;
  timeZone: RegisterInput["timeZone"];
  otpHash: string;
}

// OTP Verification
export interface RegisterOTPVerificationInput {
  registrationId: string;
  otp: string;
}

// ResendOtp
export interface ResendOtpOutput {
  registrationId: string;
}

// VerifyEmail
export interface VerifyEmailInput {
  email: UserProps["email"];
}
export interface VerifyEmailOutput {
  resetRequestId: string;
}

// Pending password reset
export interface PendingPasswordReset {
  userId: string;
  email: string;
  otpHash: string;
}

// Verify otp for reset password
export interface VerifyResetOtpInput {
  resetRequestId: string;
  otp: string;
}
export interface VerifyResetOtpOutput {
  resetGrant: string;
}

export interface PasswordResetGrant {
  userId: string;
}

export interface ResetPasswordInput {
  resetGrant: string;
  password: string;
}

// Login
export interface LoginInput {
  email: UserProps["email"];
  password: string;
}
export interface LoginOutput {
  tokens: AuthTokens;
  user: Pick<
    UserProps,
    | "username"
    | "email"
    | "role"
    | "onboardingType"
    | "onboardingStatus"
    | "isBlocked"
    | "phone"
    | "profileImage"
  > &
    Partial<
      Pick<
        ProviderProfileProps,
        | "isAddressVerified"
        | "isServiceDetailsVerified"
        | "isAvailabilityVerified"
        | "isProofsVerified"
        | "isAdminVerified"
        | "verificationRejectionReason"
        | "adminVerificationStatus"
        | "hasUsedTrial"
      >
    > & {
      uid: UserProps["_id"];
      isLoggedIn: boolean;
      isAddressAdded: boolean;

      isServiceDetailsAdded?: boolean;
      isServiceAvailabilityAdded?: boolean;
      isProofSubmitted?: {
        identityProof: boolean;
        serviceProof: boolean;
      };

      providerSubscription?: string;

      timeZone: string;
    };
}

// GoogleAuthOrchestration
export interface GoogleAuthOrchestrationInput {
  googleId: string;
  email: string;
  name: string;
  image: string | null;
  timeZone: TimeZone;
}
export interface GoogleAuthOrchestrationOutput {
  tokens: AuthTokens;
  user: Pick<
    UserProps,
    | "username"
    | "email"
    | "role"
    | "onboardingType"
    | "onboardingStatus"
    | "isBlocked"
    | "phone"
    | "profileImage"
  > &
    Partial<
      Pick<
        ProviderProfileProps,
        | "isAddressVerified"
        | "isServiceDetailsVerified"
        | "isAvailabilityVerified"
        | "isProofsVerified"
        | "isAdminVerified"
        | "verificationRejectionReason"
        | "adminVerificationStatus"
        | "hasUsedTrial"
      >
    > & {
      uid: UserProps["_id"];
      isAddressAdded: boolean;
      isLoggedIn: boolean;

      isServiceDetailsAdded?: boolean;
      isServiceAvailabilityAdded?: boolean;
      isProofSubmitted?: {
        identityProof: boolean;
        serviceProof: boolean;
      };

      providerSubscription?: string;

      timeZone: string;
    };
}

/**
 * Auth service dtos
 */

// Base user response
export type BaseUserResponse = Pick<
  UserProps,
  | "username"
  | "email"
  | "role"
  | "onboardingType"
  | "onboardingStatus"
  | "isBlocked"
  | "phone"
  | "profileImage"
> & {
  uid: UserProps["_id"];
  isLoggedIn: boolean;
  isAddressAdded: boolean;
  timeZone: string;
};

// Provider prrof status
export interface ProviderProofStatus {
  identityProof: boolean;
  serviceProof: boolean;
}

// Provider ( user with rpvider role ) response
export type ProviderFieldsResponse = Pick<
  ProviderProfileProps,
  | "isAddressVerified"
  | "isServiceDetailsVerified"
  | "isAvailabilityVerified"
  | "isProofsVerified"
  | "isAdminVerified"
  | "verificationRejectionReason"
  | "adminVerificationStatus"
  | "hasUsedTrial"
> & {
  isServiceDetailsAdded: boolean;
  isServiceAvailabilityAdded: boolean;
  isProofSubmitted?: ProviderProofStatus;
  providerSubscription?: string;
};
