import { CommonDateInput } from "./common.dto";
import { Role } from "../../domain/enums/common.enum";
import { ApiPaginationInput, StatMetric } from "./common.dto";
import { UserProps } from "../../domain/contracts/user.contract";
import { ServiceProps } from "../../domain/contracts/service.contract";
import { ProviderProfileProps } from "../../domain/contracts/providerProfile.contract";
import { ProviderServiceProps } from "../../domain/contracts/providerService.contract";

/**
 * User queries dtos
 */

// findStats method 
export interface UserStatsDataQuery extends CommonDateInput {
    timeZone: string;
}
export interface UserStatsDataView extends Record<string, StatMetric | undefined> {
    totalUsers: StatMetric;
    blockedUsers?: StatMetric;
    NewUsers?: StatMetric;
    ReturningUsers?: StatMetric;
}


// findUsers method 
export interface UsersQuery extends ApiPaginationInput { };
export type UsersView = Array<Pick<UserProps, "_id" | "username" | "email" | "isBlocked">>;


// findProviders method 
export interface ProvidersQuery extends ApiPaginationInput { };
export type ProvidersView = Array<Pick<UserProps, "_id" | "username" | "email" | "isBlocked"> & Pick<ProviderProfileProps, "adminVerificationStatus" | "isAdminVerified" | "trustedBySlotflow">>;


// findProviderById method 
export interface ProviderByIdQuery {
    providerId: UserProps["_id"];
}
export type ProviderByIdView = Pick<UserProps, "username" | "email" | "isBlocked" | "profileImage" | "phone" | "createdAt" | "referralCode"> & Pick<ProviderProfileProps, "isAdminVerified" | "trustedBySlotflow" | "adminVerificationStatus" | "isAddressVerified" | "isAvailabilityVerified" | "isProofsVerified" | "isServiceDetailsVerified"> | null;


// findProviderStats method 
export interface ProviderStatsDataQuery extends CommonDateInput {
    timeZone: string;
};
export interface ProviderStatsDataView extends Record<string, StatMetric | undefined> {
    totalProviders: StatMetric;
    adminVerifiedProviders: StatMetric;
    blockedProviders: StatMetric;
    slotflowTrustedProviders: StatMetric;
};


// findNewVsReturningUserStats method 
export type UserChartDataQuery = CommonDateInput & Pick<UserProps, "role"> & {
    timeZone: string;
};
export type UserChartDataView = Array<{
  date: string;
  newUsers: number;
  returningUsers: number;
}>;





/**
 * User usecase dtos
 */

// UpdateUserProfileImage 
export type UpdateUserProfileImageInput = Pick<UserProps, "profileImage"> & {
    userId: UserProps["_id"],
}
export type UpdateUserProfileImageOutput = UserProps["profileImage"];


// UpdateUserProfileInfo 
export type UpdateUserProfileInfoInput = Pick<UserProps, "username" | "phone" | "timeZone"> & {
    userId: UserProps["_id"];
}
export type UpdateUserProfileInfoOutput = Pick<UserProps, "username" | "phone">


// FindProviderService 
type FindProviderServiceProps = Pick<ProviderServiceProps,
    "serviceName" |
    "serviceDescription" |
    "servicePrice" |
    "serviceExperience" |
    "videoUrl" |
    "serviceType" |
    "requirements" |
    "maxParticipants" |
    "isGroupService"
>;
export interface FindProviderServiceOutput extends FindProviderServiceProps {
    service: Pick<ServiceProps, "serviceName">
}


// Admin get user profile details
export interface GetUserProfileDetailsInput {
    userId: UserProps["_id"];
    isAdmin: boolean;
}
export type GetUserProfileDetailsOutput = Pick<UserProps, "username" | "phone" | "isBlocked" | "email" | "createdAt" | "profileImage"> & Partial<Pick<UserProps, "referralCode">> | null;


// Admin change block status of user  
export type ChangeUserIsBlockedStatusInput = {
    userId: UserProps["_id"];
} & Pick<UserProps, "isBlocked">;
export type ChangeUserIsBlockedStatusOutput = Pick<UserProps, "_id" | "isBlocked">;


// User / Provider profile setup ( preboarding )
export type ProfileSetupInput = Pick<UserProps, "role" | "_id" | "username"> & {
    whereDidHearAboutUs: UserProps["whereDidHearAboutUs"];
    referralCode?: string;
};
export type ProfileSetupOutput = Pick<UserProps, "onboardingType" | "onboardingStatus"> & {
    adminVerificationStatus: ProviderProfileProps["adminVerificationStatus"] | null,
    token: string;
};


// GetUsers
export type GetUsersOutput = UsersView


// GetProviders
export type GetProvidersOutput = Array<Pick<UserProps, "_id" | "username" | "email" | "isBlocked"> & Pick<ProviderProfileProps, "adminVerificationStatus" | "isAdminVerified" | "trustedBySlotflow">>;


// ProviderGetOwnProfileDetails 
export interface ProviderGetOwnProfileDetailsInput {
    providerId: UserProps["_id"];
}
export type ProviderGetOwnProfileDetailsOutput = Pick<UserProps, "username" | "email" | "isBlocked" | "phone" | "createdAt" | "referralCode" | "profileImage"> & Pick<ProviderProfileProps, "isAdminVerified" | "trustedBySlotflow" | "adminVerificationStatus" | "isAddressVerified" | "isAvailabilityVerified" | "isProofsVerified" | "isServiceDetailsVerified"> | null;


// UserGetServiceProviderDetails 
export interface UserGetServiceProviderDetailsInput {
    providerId: string;
}
export type UserGetServiceProviderDetailsOutput = Pick<UserProps, "username" | "email" | "phone" | "profileImage"> & Pick<ProviderProfileProps, "trustedBySlotflow">;


// GetUserForChatSidebarUseCase 
export interface GetUserForChatSidebarInput {
    userId: UserProps["_id"];
    role: Role;
    timeZone: string;
}
export type GetUserForChatSidebarOutput = Array<Pick<UserProps, "_id" | "username" | "profileImage">> | [];


// AdminGetProviderDetails 
export interface AdminGetProviderDetailsInput {
    providerId: UserProps["_id"];
}
export type AdminGetProviderDetailsOutput = Pick<UserProps, "_id" | "username" | "email" | "phone" | "createdAt" | "profileImage" | "isBlocked"> & Pick<ProviderProfileProps, "adminVerificationStatus" | "isAddressVerified" | "isAdminVerified" | "isAvailabilityVerified" | "isProofsVerified" | "isServiceDetailsVerified" | "trustedBySlotflow"> | null;


// GetProviderProofs 
export interface GetProviderProofsInput {
    providerId: UserProps["_id"];
};
export type GetProviderProofsOutput = Pick<ProviderProfileProps, "identityProof" | "serviceProof">;


// UpdatePassword 
export interface UpdatePasswordInput {
    userId: UserProps["_id"];
    currentPassword: string;
    newPassword: string;
}