import { GetStatsDataCommonRequest } from "./admin.dto";
import { Review } from "../../domain/entities/review.entity";
import { ServiceMode } from "../../domain/enums/service.enum";
import { UserDTO, BookingDTO, ServiceDTO, ProviderServiceDTO, TimeSlotForFrontendResponse, ReviewDTO, ProviderProfileDTO } from "./common.dto";

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

// user appointment booking via stripe creating session id use case request payload
export interface UserAppointmentBookingViaStripeRequest {
    userId: UserDTO["_id"];
    providerId: UserDTO["_id"];
    slotId: TimeSlotForFrontendResponse["_id"];
    selectedServiceMode: ServiceMode;
    date: Date
}

// use save appointment booking after stripe payment use case request payload
export interface UserSaveAppoinmentBookingRequest {
    userId: UserDTO["_id"];
    sessionId: string;
}

// user can cel booking use case request payload interface
export interface UserCancelBookingRequest {
    userId: UserDTO["_id"];
    bookingId: BookingDTO["_id"];
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
export interface GetUserDataRequest extends GetStatsDataCommonRequest { }




////  user queries dtos

// used as the return type of the admin get dashboard user stats data
export interface GetUserDataResponse {
    totalUsers: number;
    blockedUsers: number;
};

// Used as the response type of get users
export type GetUsersResponse = Array<Pick<UserDTO, "_id" | "username" | "email" | "isBlocked">>;

// Used as the response type of get providers
export type GetProvidersResponse = Array<Pick<UserDTO, "_id" | "username" | "email" | "isBlocked"> & Pick<ProviderProfileDTO, "adminVerificationStatus" | "isAdminVerified" | "trustedBySlotflow">>;

// Used as the response type of get provider profile details
export type GetProviderProfileDetailsResponse = Pick<UserDTO, "username" | "email" | "isBlocked" | "profileImage" | "phone" | "createdAt"> & Pick<ProviderProfileDTO, "isAdminVerified" | "trustedBySlotflow" | "adminVerificationStatus" | "isAddressVerified" | "isAvailabilityVerified" | "isProofsVerified" | "isServiceDetailsVerified"> | null;