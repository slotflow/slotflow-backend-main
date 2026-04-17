import { Role } from "../../domain/enums/common.enum";
import { GetStatsDataCommonInput } from "./admin.dto";
import { UserDTO, ServiceDTO, ProviderServiceDTO, ProviderProfileDTO, ApiPaginationInput } from "./common.dto";

//// ****  user queries parameter and return type **** ////

// 1. findStats method parameter and return
export interface UserDataQuery extends GetStatsDataCommonInput { }
export interface UserDataView {
    totalUsers: number;
    blockedUsers: number;
};

// 2. findUsers method parameter and return
export interface UsersQuery extends ApiPaginationInput { };
export type UsersView = Array<Pick<UserDTO, "_id" | "username" | "email" | "isBlocked">>;

// 3. findProviders method parameter and return
export interface ProvidersQuery extends ApiPaginationInput { };
export type ProvidersView = Array<Pick<UserDTO, "_id" | "username" | "email" | "isBlocked"> & Pick<ProviderProfileDTO, "adminVerificationStatus" | "isAdminVerified" | "trustedBySlotflow">>;

// 4. findProviderById method parameter and return
export interface ProviderByIdQuery {
    providerId: UserDTO["_id"];
}
export type ProviderByIdView = Pick<UserDTO, "username" | "email" | "isBlocked" | "profileImage" | "phone" | "createdAt"> & Pick<ProviderProfileDTO, "isAdminVerified" | "trustedBySlotflow" | "adminVerificationStatus" | "isAddressVerified" | "isAvailabilityVerified" | "isProofsVerified" | "isServiceDetailsVerified"> | null;

// 5. findProviderStats method parameter and return
export interface ProviderStatsQuery extends GetStatsDataCommonInput { };
export interface ProviderStatsView {
    totalProviders: number;
    adminVerifiedProviders: number;
    blockedProviders: number;
    addressAddedProviders: number;
    serviceAddedProviders: number;
    availabilityAddedProviders: number;
    slotflowTrustedProviders: number;
};









//// ****  user useCase dtos **** ////

// UpdateUserProfileImage usecase input output
export type UpdateUserProfileImageInput = Pick<UserDTO, "profileImage"> & {
    userId: UserDTO["_id"],
}
export type UpdateUserProfileImageOutput = UserDTO["profileImage"];

// UpdateUserProfileInfo usecase input output
export interface UpdateUserProfileInfoInput {
    userId: UserDTO["_id"];
    username: UserDTO["username"];
    phone: UserDTO["phone"];
}
export type UpdateUserProfileInfoOutput = Pick<UserDTO, "username" | "phone">

// ChangePushNotification usecase input output
export interface ChangePushNotificationInput {
    userId: UserDTO["_id"];
    allowPushNotification: boolean;
};

// FindProviderService usecase input
type FindProviderServiceProps = Pick<ProviderServiceDTO, "serviceName" | "serviceDescription" | "servicePrice" | "serviceExperience" | "videoUrl" | "serviceType" | "serviceMode" | "requirements" | "maxParticipants" | "isGroupService">;
export interface FindProviderServiceOutput extends FindProviderServiceProps {
    service: Pick<ServiceDTO, "serviceName">
}

// Used as the request interface of admin get user profile details
export interface GetUserProfileDetailsInput {
    userId: UserDTO["_id"];
    isAdmin: boolean;
}
// Used as the response type of admin get user profile details
export type GetUserProfileDetailsOutput = Pick<UserDTO, "username" | "phone" | "isBlocked" | "email" | "createdAt"> & Partial<Pick<UserDTO, "profileImage">> | null;

// Used as the request interface of admin change block status of user  
export interface ChangeUserIsBlockedStatusInput {
    userId: UserDTO["_id"];
    isBlocked: UserDTO["isBlocked"];
};
// Used as the response type of admin change user block status
export type ChangeUserIsBlockedStatusOutput = ChangeUserIsBlockedStatusInput;

export type setRoleInput = Pick<UserDTO, "role" | "_id">;
export type setRoleOutput = Pick<UserDTO, "isOnboardingCompleted" | "hasSelectedRole">;

// GetUserData usecase input output
export type GetUserDataInput = UserDataQuery;
export type GetUserDataOutput = UserDataView;

// GetUsers usecase input output
export type GetUsersOutput = UsersView

// GetProviderData usecase input output
export interface GetProviderDataInput extends GetStatsDataCommonInput { }
export interface GetProviderDataOutput {
    totalProviders: number;
    adminVerifiedProviders: number;
    blockedProviders: number;
    addressAddedProviders: number;
    serviceAddedProviders: number;
    availabilityAddedProviders: number;
    slotflowTrustedProviders: number;
};

// GetProviders usecase input output
export type GetProvidersOuput = Array<Pick<UserDTO, "_id" | "username" | "email" | "isBlocked"> & Pick<ProviderProfileDTO, "adminVerificationStatus" | "isAdminVerified" | "trustedBySlotflow">>;

// ProviderGetOwnProfileDetails usecase input output
export interface ProviderGetOwnProfileDetailsInput {
    providerId: UserDTO["_id"];
}
export type ProviderGetOwnProfileDetailsOutput = Pick<UserDTO, "username" | "email" | "isBlocked" | "phone" | "createdAt"> & Pick<ProviderProfileDTO, "isAdminVerified" | "trustedBySlotflow" | "adminVerificationStatus" | "isAddressVerified" | "isAvailabilityVerified" | "isProofsVerified" | "isServiceDetailsVerified"> | null;

// UserGetServiceProviderDetails usecase input output
export interface UserGetServiceProviderDetailsInput {
    providerId: string;
}
export type UserGetServiceProviderDetailsOutput = Pick<UserDTO, "username" | "email" | "phone" | "profileImage"> & Pick<ProviderProfileDTO, "trustedBySlotflow">;

// GetUserForChatSidebarUseCase usecase input output
export interface GetUserForChatSidebarInput {
    userId: UserDTO["_id"];
    role: Role;
}
export type GetUserForChatSidebarOutput = Array<Pick<UserDTO, "_id" | "username" | "profileImage">>

// AdminGetProviderDetails usecase input output
export interface AdminGetProviderDetailsInput {
    providerId: UserDTO["_id"];
}
export type AdminGetProviderDetailsOutput = Pick<UserDTO, "_id" | "username" | "email" | "phone" | "createdAt" | "profileImage" | "isBlocked"> & Pick<ProviderProfileDTO, "adminVerificationStatus" | "isAddressVerified" | "isAdminVerified" | "isAvailabilityVerified" | "isProofsVerified" | "isServiceDetailsVerified" | "trustedBySlotflow"> | null;

// GetProviderProofs usecase input output
export interface GetProviderProofsInput {
    providerId: UserDTO["_id"];
};
export type GetProviderProofsOutput = Pick<ProviderProfileDTO, "identityProof" | "serviceProof">;