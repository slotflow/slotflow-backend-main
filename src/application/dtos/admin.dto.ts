import { AddressDTO, ProviderProfileDTO, ReviewDTO, ServiceDTO, UserDTO } from "./common.dto";

// Used as the request type of admin get dashboard stats data
export interface GetStatsDataCommonRequest {
    startDate: Date;
    endDate: Date;
}

// Used as the request type of admin get dashboard provider stats data
export interface GetProviderDataRequest extends GetStatsDataCommonRequest {}

// Used as the request type of admin get dashboard subscription stats data
export interface GetSubscriptionDataRequest extends GetStatsDataCommonRequest {}

// Used as the request type of admin get dashboard appointments stats data
export interface GetBookingsDataRequest extends GetStatsDataCommonRequest {}

// Used as the request type of admin get provider address
export type AdminGetUserAddressResponse = Pick<AddressDTO, "userId" | "addressLine" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location"> | null;

// used as the return type of the admin dashboard todays stats data
export interface GetDashboardTodayDataResponse {
    newUsers: number;
    newProviders: number;

    todaysAppointments: number;
    todaysCancelledAppointments: number;
    todaysCompletedAppointments: number;
};

// used as the return type of the admin get dashboard provider stats data
export interface GetProviderDataResponse {
    totalProviders: number;
    adminVerifiedProviders: number;
    blockedProviders: number;
    addressAddedProviders: number;
    serviceAddedProviders: number;
    availabilityAddedProviders: number;
    slotflowTrustedProviders: number;
};

// used as the return type of the admin dashboard subscription stats data
export interface GetSubscriptionDataResponse {
    activeSubscriptions: number;
    expiredSubscriptions: number;
    subscriptionsByFreePlan: number;
    subscriptionsByStarterPlan: number;
    subscriptionsByProfessionalPlan: number;
    subscriptionsByEnterprisePlan: number;
};

// used as the return type of the admin get dashboard appointments stats data
export interface GetBookingsDataResponse {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    missedAppointments: number;
    rejectedAppointments: number;
};

// Used as the request interface of admin approve provider
export interface AdminApproveProviderRequest {
    providerId: UserDTO["_id"];
};
// Used as the request interface of admin reject provider
export type AdminRejectProviderRequest = Pick<ProviderProfileDTO, "verificationRejectionReason" | "isAddressVerified" | "isServiceDetailsVerified" | "isAvailabilityVerified" | "isProofsVerified"> & {
    providerId: UserDTO["_id"];
};

// Used as the request interface of admin change provider block status
export interface AdminChangeProviderBlockStatusRequest {
    providerId: UserDTO["_id"];
    isBlocked: UserDTO["isBlocked"];
};
// Used as the response type of admin change provider block status
export type AdminChangeProviderBlockStatusResponse = AdminChangeProviderBlockStatusRequest;

// Used as the request interface of admin change provider trust tag 
export interface AdminChangeProviderTrustTagRequest {
    providerId: UserDTO["_id"];
    trustedBySlotflow: ProviderProfileDTO["trustedBySlotflow"];
};
// Used as the response type of admin change provider trust tag 
export type AdminChangeProviderTrustTagResponse = AdminChangeProviderTrustTagRequest;

// Used as the request interface of admin chage review block status
export interface ToggleReviewBlockStatusRequest {
    reviewId: ReviewDTO["_id"];
    isBlocked: ReviewDTO["isBlocked"];
};
// Used as the response interface of admin chage review block status
export type ToggleReviewBlockStatusResponse = ToggleReviewBlockStatusRequest;