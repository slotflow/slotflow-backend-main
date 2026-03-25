import { Review } from "../../domain/entities/review.entity";
import { ServiceCategory, ServiceMode } from "../../domain/enums/service.enum";
import { ProviderService } from "../../domain/entities/providerService.entity";
import { AddressDTO, UserDTO, ProviderDTO, BookingDTO, ServiceDTO, ProviderServiceDTO, FontendAvailabilityForResponse, TimeSlotForFrontendResponse, ReviewDTO } from "./common.dto";


// ************ used in userProfile.use-case ************ \\
// user fetch profile use case request payload interface
export interface UserFetchProfileRequest {
    userId: UserDTO["_id"];
}
// user fetch profile details use case response interface
export type UserFetchProfileDetailsResponse = Pick<UserDTO, "username" | "email" | "isBlocked" | "isEmailVerified" | "phone" | "createdAt"> | {};


// user update profile image use case request payload interface 
export type UsrUpdateProfileImageRequest = Pick<UserDTO, "profileImage"> & {
    userId: UserDTO["_id"],
}
// user update profile image use case response interface
export type UserUpdateProfileImageResponse = UserDTO["profileImage"];


// user update user info request payload interface
export interface UserUpdateUserInfoRequest {
    userId: UserDTO["_id"];
    username: UserDTO["username"];
    phone: UserDTO["phone"];
}
// user update user info use case response interface
export type UserUpdateUserInfoResponse = Pick<UserDTO, "username" | "phone">

//
export interface UserUpdatePushNotificationRequest {
    userId: UserDTO["_id"];
    allowPushNotification: boolean;
};




// ************ used in userAddress.use-case ************ \\

// user fetch user address use case request payload interface

// user fetch user address use case response interface




// ************ used in userProvider.use-case ************ \\

// user fetch service providers use case request payload interface
export interface UserFetchServiceProvidersRequest {
    serviceIds?: ProviderService["_id"][];
    categories?: ServiceCategory[];
    location?: AddressDTO["location"];
    maxPrice?: number;
    minPrice?: number;
    slotflowTrusted?: boolean;
    radius?: number;
    skip?: number;
    limit?: number;
};
// user fetch service providers use case response interface
export interface FindProvidersUsingServiceIdsResponse {
    _id: string;
    provider: {
        _id: string;
        username: string;
        profileImage: string | null;
        trustedBySlotflow: boolean;
    },
    serviceDetails: {
        serviceId: string;
        service: ServiceDTO["serviceName"];
        serviceCategory: ServiceDTO["serviceCategory"];
        serviceName: ProviderServiceDTO["serviceName"];
        servicePrice: ProviderServiceDTO["servicePrice"];
    }
}
export type UserFetchServiceProvidersResponse = FindProvidersUsingServiceIdsResponse




// user fetch provider service use case request payload interface
export interface UserFetchServiceproviderServiceRequest {
    providerId: ProviderDTO["_id"];
}
// user fetch provider service use case response interface
type FindProviderServiceProps = Pick<ProviderServiceDTO, "serviceName" | "serviceDescription" | "servicePrice" | "serviceExperience" | "videoUrl" | "serviceType" | "serviceMode" | "requirements" | "maxParticipants" | "isGroupService">;
export interface FindProviderServiceResponse extends FindProviderServiceProps {
    service: Pick<ServiceDTO, "serviceName">
}
export type UserFetchProviderServiceResponse = FindProviderServiceResponse | null;




// user fetch providers for chat side bar
export interface UserFetchProvidersForChatSidebarRequest {
    userId: UserDTO["_id"]
}
export type UserFetchProvidersForChatSidebarResponse = Array<Pick<ProviderDTO, "_id" | "username" | "profileImage">>;





// ************ used in userBooking.use-case ************ \\

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