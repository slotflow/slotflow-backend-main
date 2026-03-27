import { AddressDTO, ProviderDTO, ReviewDTO, ServiceDTO } from "./common.dto";

// Used as the request type of admin fetch dashboard stats data
export interface GetStatsDataCommonRequest {
    startDate: Date;
    endDate: Date;
}

// Used as the request type of admin fetch dashboard user stats data
export interface FetchUserDataRequest extends GetStatsDataCommonRequest {}

// Used as the request type of admin fetch dashboard provider stats data
export interface FetchProviderDataRequest extends GetStatsDataCommonRequest {}

// Used as the request type of admin fetch dashboard subscription stats data
export interface FetchSubscriptionDataRequest extends GetStatsDataCommonRequest {}

// Used as the request type of admin fetch dashboard appointments stats data
export interface FetchBookingsDataRequest extends GetStatsDataCommonRequest {}

// Used as the request type of admin fetch provider address
export type AdminFetchUserOrProviderAddressResponse = Pick<AddressDTO, "userId" | "addressLine" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location"> | null;

// used as the return type of the admin fetch dashboard todays stats data
export interface FetchDashboardTodayDataResponse {
    newUsers: number;
    newProviders: number;

    todaysAppointments: number;
    todaysCancelledAppointments: number;
    todaysCompletedAppointments: number;
};

// used as the return type of the admin fetch dashboard user stats data
export interface FetchUserDataResponse {
    totalUsers: number;
    emailVerifiedUsers: number;
    blockedUsers: number;
};

// used as the return type of the admin fetch dashboard provider stats data
export interface FetchProviderDataResponse {
    totalProviders: number;
    emailVerifiedProviders: number;
    adminVerifiedProviders: number;
    blockedProviders: number;
    addressAddedProviders: number;
    serviceAddedProviders: number;
    availabilityAddedProviders: number;
    slotflowTrustedProviders: number;
};

// used as the return type of the admin fetch dashboard subscription stats data
export interface FetchSubscriptionDataResponse {
    activeSubscriptions: number;
    expiredSubscriptions: number;
    subscriptionsByFreePlan: number;
    subscriptionsByStarterPlan: number;
    subscriptionsByProfessionalPlan: number;
    subscriptionsByEnterprisePlan: number;
};

// used as the return type of the admin fetch dashboard appointments stats data
export interface FetchBookingsDataResponse {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    missedAppointments: number;
    rejectedAppointments: number;
};

// Used as the response type of admin fetch all providers
export type AdiminFetchAllProviders = Array<Pick<ProviderDTO, "_id" | "username" | "email" | "isBlocked" | "isAdminVerified" | "isEmailVerified" | "trustedBySlotflow" | "adminVerificationStatus">>;

// Used as the request interface of admin approve provider
export interface AdminApproveProviderRequest {
    providerId: ProviderDTO["_id"];
};
// Used as the request interface of admin reject provider
export type AdminRejectProviderRequest = Pick<ProviderDTO, "verificationRejectionReason" | "isAddressVerified" | "isServiceDetailsVerified" | "isAvailabilityVerified" | "isProofsVerified"> & {
    providerId: ProviderDTO["_id"];
};

// Used as the request interface of admin change provider block status
export interface AdminChangeProviderBlockStatusRequest {
    providerId: ProviderDTO["_id"];
    isBlocked: ProviderDTO["isBlocked"];
};
// Used as the response type of admin change provider block status
export type AdminChangeProviderBlockStatusResponse = AdminChangeProviderBlockStatusRequest;

// Used as the request interface of admin change provider trust tag 
export interface AdminChangeProviderTrustTagRequest {
    providerId: ProviderDTO["_id"];
    trustedBySlotflow: ProviderDTO["trustedBySlotflow"];
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

// Used as the request interface of admin fetch all app services
export type AdminServiceListResponse = Array<Pick<ServiceDTO, "_id" | "serviceName" | "isBlocked" | "serviceCategory">>;

// admin add new service use case request payload interface
export type AdminAddServiceRequest = Pick<ServiceDTO, "serviceName" | "serviceCategory">;