import { Review } from "../../domain/entities/review.entity";
import { ServiceMode } from "../../domain/enums/service.enum";
import { UserDTO, ProviderDTO, BookingDTO, ServiceDTO, ProviderServiceDTO, TimeSlotForFrontendResponse, ReviewDTO } from "./common.dto";

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

// user fetch provider service use case request payload interface
export interface UserFetchServiceproviderServiceRequest {
    providerId: ProviderDTO["_id"];
}

// user fetch provider service use case response interface
type FindProviderServiceProps = Pick<ProviderServiceDTO, "serviceName" | "serviceDescription" | "servicePrice" | "serviceExperience" | "videoUrl" | "serviceType" | "serviceMode" | "requirements" | "maxParticipants" | "isGroupService">;
export interface FindProviderServiceResponse extends FindProviderServiceProps {
    service: Pick<ServiceDTO, "serviceName">
}

// user fetch provider service use case response interface
export type UserFetchProviderServiceResponse = FindProviderServiceResponse | null;

// user appointment booking via stripe creating session id use case request payload
export interface UserAppointmentBookingViaStripeRequest {
    userId: UserDTO["_id"];
    providerId: ProviderDTO["_id"];
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

// Used as the request interface of admin fetch user profile details
export interface GetUserProfileDetailsRequest {
    userId: UserDTO["_id"];
    isAdmin: boolean;
}
// Used as the response type of admin fetch user profile details
export type GetUserProfileDetailsResponse = Pick<UserDTO, "username" | "phone" | "isEmailVerified" | "isBlocked" | "email" | "createdAt"> & Partial<Pick<UserDTO, "profileImage">> | null;

// Used as the request interface of admin change block status of user  
export interface ChangeUserIsBlockedStatusRequest {
    userId: UserDTO["_id"];
    isBlocked: UserDTO["isBlocked"];
};
// Used as the response type of admin change user block status
export type ChangeUserIsBlockedStatusResponse = ChangeUserIsBlockedStatusRequest;

// admin fetch users response interface
export type GetUsersResponse = Array<Pick<UserDTO, "_id" | "username" | "email" | "isBlocked" | "isEmailVerified">>;
