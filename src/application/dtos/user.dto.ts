import { Role } from "../../domain/enums/common.enum";
import { GetStatsDataCommonInput } from "./admin.dto";
import { Review } from "../../domain/entities/review.entity";
import { UserDTO, ServiceDTO, ProviderServiceDTO, ReviewDTO, ProviderProfileDTO, ApiPaginationInput } from "./common.dto";

// user update profile image use case request payload interface 
export type UpdateUserProfileImageRequest = Pick<UserDTO, "profileImage"> & {
    userId: UserDTO["_id"],
}

// user update profile image use case response interface
export type UpdateUserProfileImageResponse = UserDTO["profileImage"];

// user update user info request payload interface
export interface UpdateUserProfileInfoRequest {
    userId: UserDTO["_id"];
    username: UserDTO["username"];
    phone: UserDTO["phone"];
}

// user update user info use case response interface
export type UpdateUserProfileInfoResponse = Pick<UserDTO, "username" | "phone">

// change push notification request
export interface ChangePushNotificationRequest {
    userId: UserDTO["_id"];
    allowPushNotification: boolean;
};

// user get provider service use case request payload interface
export interface UserGetServiceproviderServiceRequest {
    providerId: UserDTO["_id"];
}

// user get provider service use case response interface
type FindProviderServiceProps = Pick<ProviderServiceDTO, "serviceName" | "serviceDescription" | "servicePrice" | "serviceExperience" | "videoUrl" | "serviceType" | "serviceMode" | "requirements" | "maxParticipants" | "isGroupService">;
export interface FindProviderServiceResponse extends FindProviderServiceProps {
    service: Pick<ServiceDTO, "serviceName">
}

// user get provider service use case response interface
export type UserGetProviderServiceResponse = FindProviderServiceResponse | null;

// use save appointment booking after stripe payment use case request payload
export interface UserSaveAppointmentBookingRequest {
    userId: UserDTO["_id"];
    sessionId: string;
}

// user create review request
export type CreateReviewRequset = Pick<ReviewDTO, "reviewText" | "rating" | "userId" | "providerId" | "bookingId">;

// User delete review
export interface UserDeleteReviewRequest {
    reviewId: Review["_id"];
    userId: UserDTO["_id"];
}

// Used as the request interface of admin get user profile details
export interface GetUserProfileDetailsRequest {
    userId: UserDTO["_id"];
    isAdmin: boolean;
}
// Used as the response type of admin get user profile details
export type GetUserProfileDetailsResponse = Pick<UserDTO, "username" | "phone" | "isBlocked" | "email" | "createdAt"> & Partial<Pick<UserDTO, "profileImage">> | null;

// Used as the request interface of admin change block status of user  
export interface ChangeUserIsBlockedStatusRequest {
    userId: UserDTO["_id"];
    isBlocked: UserDTO["isBlocked"];
};
// Used as the response type of admin change user block status
export type ChangeUserIsBlockedStatusResponse = ChangeUserIsBlockedStatusRequest;

export type setRoleRequest = Pick<UserDTO, "role" | "_id">;

export type setRoleResponse = Pick<UserDTO, "isOnboardingCompleted" | "hasSelectedRole">;

// Used as the request type of admin get dashboard user stats data




//// ****  user queries dtos **** ////

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

// used in admin get provider details usecase
export interface AdminGetProviderDetailsInput {
    providerId: UserDTO["_id"];
}
export type AdminGetProviderDetailsOutput = Pick<UserDTO, "_id" | "username" | "email" | "phone" | "createdAt" | "profileImage" | "isBlocked"> & Pick<ProviderProfileDTO, "adminVerificationStatus" | "isAddressVerified" | "isAdminVerified" | "isAvailabilityVerified" | "isProofsVerified" | "isServiceDetailsVerified" | "trustedBySlotflow"> | null;

// 
// **** Used in get provider proofs usecase
export interface GetProviderProofsInput {
    providerId: UserDTO["_id"];
};

export type GetProviderProofsOutput = Pick<ProviderProfileDTO, "identityProof" | "serviceProof">;