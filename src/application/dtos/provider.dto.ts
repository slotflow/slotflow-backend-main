import Stripe from "stripe";
import { Review } from "../../domain/entities/review.entity";
import { AddressDTO, BookingDTO, ProviderDTO, UserDTO, PlanDTO, SubscriptionPlan, ProviderServiceDTO, ServiceDTO, FrontendAvailabilityForRequest, FontendAvailabilityForResponse } from "./common.dto";


// ************ used in providerAddress.use-case ************ \\
// provider fetch address use case request payload interface
export interface ProviderFetchAddressRequest {
    providerId: ProviderDTO["_id"];
}
// provider fetch address use case response interface
export type ProviderFetchAddressResponse = Pick<AddressDTO, "_id" | "addressLine" | "landMark" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location"> | null;





// ************ used in providerService.use-case ************ \\

// provider fetch service details use case request payload
export interface ProviderFetchProviderServiceRequest {
    providerId: ProviderDTO["_id"];
}
// provider fetch service details use case respomse interface
type FindProviderServiceProps = Pick<ProviderServiceDTO, "_id" | "serviceName" | "serviceDescription" | "servicePrice" | "isGroupService" | "maxParticipants" | "requirements" | "serviceExperience" | "serviceMode" | "serviceType" | "tags" | "videoUrl" | "updatedAt" | "createdAt">;
export interface ProviderFindProviderServiceResProps extends FindProviderServiceProps {
    serviceId: Pick<ServiceDTO, "serviceName">;
}
export type ProviderFetchProviderServiceResponse = ProviderFindProviderServiceResProps | {};


// provider update service details use case request type
export type ProviderUpdateProviderServiceRequest = Pick<ProviderServiceDTO, "providerId" | "service" | "serviceName" | "serviceDescription" | "servicePrice" | "isGroupService" | "maxParticipants" | "serviceExperience" | "serviceMode" | "serviceType" | "tags"> & Partial<Pick<ProviderServiceDTO, "videoUrl" | "requirements">> & {
    providerServiceId: ProviderServiceDTO["_id"];
}
export type ProviderUpdateProviderServiceResponse = ProviderFindProviderServiceResProps;





// ************ used in providerPlan.use-case ************ \\
// provider fetch all plans use case response interface 
export type ProviderFetchAllPlansResponse = Array<Pick<PlanDTO, "_id" | "planName" | "price" | "features" | "description">> | [];





// ************ used in providerProfile.use-case ************ \\
// provider fetch profile detals use case request payload interface
export interface ProviderFetchProfileDetailsRequest {
    providerId: ProviderDTO["_id"];
}
// provider fetch profile detals use case response interface
export type ProviderFetchProfileDetailsResponse = Pick<ProviderDTO, "username" | "email" | "isAdminVerified" | "isBlocked" | "isEmailVerified" | "phone" | "createdAt"> | {};


// provider update profile image use case request payload interface
export type ProviderUpdateprofileImageRequestPayload = Pick<ProviderDTO, "profileImage"> & {
    providerId: ProviderDTO["_id"];
}
// provider update profile image use case response interface 
export type ProviderUpdateprofileImageResponse = ProviderDTO["profileImage"];


// provider update providerInfo request payload interface
export interface ProviderUpdateProviderInfoRequest {
    providerId: ProviderDTO["_id"];
    username?: ProviderDTO["username"];
    phone?: ProviderDTO["phone"];
}
// provider update provider info use case response interface
export type ProviderUpdateProviderInfoResponse = Pick<ProviderDTO, "username" | "phone">;

// provider update identity proof request payload interface
export type ProviderUpdateIdentityProofRequest = Pick<ProviderDTO, "identityProof"> & {
    providerId: ProviderDTO["_id"];
}
// provider update service proof use case response interface
export type ProviderUpdateIdentityProofResponse = ProviderDTO["identityProof"];

// provider update identity proof request payload interface
export type ProviderUpdateServiceProofRequest = Pick<ProviderDTO, "serviceProof"> & {
    providerId: ProviderDTO["_id"];
}
// provider update service proof use case response interface
export type ProviderUpdateServiceProofResponse = ProviderDTO["serviceProof"];

export type ProviderUpdateProfileRequest = Pick<ProviderDTO,"_id"> & Partial<Pick<ProviderDTO, "username" | "profileImage" | "phone" | "identityProof" | "serviceProof" | "googleConnected" | "addressId" | "googleId" | "isAdminVerified" | "isEmailVerified" | "isBlocked" | "serviceAvailabilityId" | "serviceId" | "stripeAccountId" | "verificationToken" | "trustedBySlotflow" | "subscription" | "password">>

// provider admin approval
export interface ProviderAdminApprovalRequest {
    providerId: ProviderDTO["_id"];
}
export type ProviderAdminApprovalResponse = Pick<ProviderDTO, "adminVerificationStatus">; 

// provider delete proof request
export interface ProviderDeleteProofRequest {
    providerId: ProviderDTO["_id"];
}




// ************ used in providerServiceAvailability ************ \\
// provider add service availability use case reques tpayload
export interface ProviderAddServiceAvailabilityRewuest {
    providerId: ProviderDTO["_id"];
    availabilities: FrontendAvailabilityForRequest[]
}


//  provider fetch service availability use case response interface 
export interface ProviderFetchServiceAvailabilityRequest {
    providerId: ProviderDTO["_id"];
    date: Date
}
//  provider fetch service availability use case response interface 
export type ProviderFetchServiceAvailabilityResponse = FontendAvailabilityForResponse | {};





// ************ used in providerStripeSubscription.use-case ************ \\
// provider stripe subscription create sessionId use case  request payload interface
export interface ProviderStripeSubscriptionCreateSessionIdRequest {
    providerId: ProviderDTO["_id"];
    planId: PlanDTO["_id"];
    duration: string;
}
// provider stripe subscription create sessionId use case response interface
export type ProviderStripeSubscriptionCreateSessionIdResponse = string;


// provider save subscription after stripe payment use case request payload interface
export interface ProviderSaveSubscriptionRequest {
    providerId: ProviderDTO["_id"];
    sessionId: string
}
export interface ProviderSaveSubscriptionResponse {
    planName?: string
}; 





// ************ used in providerSubscription.use-case  ************ \\
// provider trial subscription use case reuest payload
export interface ProviderTrialSubscriptionRequest {
    providerId: ProviderDTO["_id"];
}





// ************ used in providerUser.use-case  ************ \\
// provider fetch users for the chat sidebar
export interface ProviderFetchUsersForChatSideBarRequest {
    providerId: ProviderDTO["_id"];
}
export type ProviderFetchUsersForChatSideBarResponse = Array<Pick<UserDTO, "_id" | "username" | "profileImage">>





// ************ used in providerDashboard.use-case  ************ \\
export interface ProviderFetchDashboardStatsDataRequest {
    providerId: ProviderDTO["_id"];
}
// Used as the response interface for the provider fetch dashboard data
export interface ProviderFetchDashboardStatsDataResponse extends ProviderFetchDashboardBookingStatsDataResponse, ProviderFetchDashboardPaymentStatsDataResponse { }
export interface ProviderFetchDashboardBookingStatsDataResponse {
    totalAppointments: number;
    completedAppointments: number;
    missedAppointments: number;
    cancelledAppointmentsByUser: number;
    rejectedAppointmentsByProvider: number;
    todaysAppointments: number;
}
export interface ProviderFetchDashboardPaymentStatsDataResponse {
    totalSubscriptionPaidAmount: number;
    totalEarnings: number;
    todaysEarnings: number;
    totalPayoutsMade: number;
    pendingPayout: number;
}


// ************ used in providerDashboard.use-case  ************ \\
// Used as the request interface for the provider fetch dashboard graph data
export interface ProviderFetchDashboardGraphDataRequest {
    providerId: ProviderDTO["_id"],
    subscription: SubscriptionPlan,
    startDate?: Date,
    endDate?: Date,
}
// Used as the return interface for the provider fetch dashboard graph data
export interface ProviderFetchDashboardGraphDataResponse {
    appointmentsOvertimeChartData: Array<{
        date: string;
        completed: number;
        missed: number;
        cancelled: number;
    }>;

    peakBookingHoursChartData: Array<{
        date: string;
        hour: string;
        bookings: number;
    }>;

    appointmentModeChartData: Array<{
        date: string;
        online: number;
        offline: number;
    }>;

    completionBreakdownChartData: Array<{
        status: 'completed' | 'missed' | 'cancelled' | 'rejected' | "confirmed" | "booked";
        value: number;
    }>;

    newVsReturningUsersChartData: Array<{
        date: string;
        newUsers: number;
        returningUsers: number;
    }>;

    topBookingDaysChartData: Array<{
        day: string;
        count: number;
    }>;
}





// ************ used in providerBooking.use-case  ************ \\
// Used as the request type for the provider change booking appointment status
export type ProviderChangeBookingAppoinmentStatusRequest = Pick<BookingDTO, "_id" | "appointmentStatus">;



// Provider Stripe UseCase
export interface ProviderStripeConnectRequest {
    providerId: ProviderDTO["_id"];
}
export type ProviderStripeConnectResponse = Stripe.Response<Stripe.AccountLink>;


// Provider Report UseCase
export interface ProviderRepostReviewRequest {
    reviewId: Review["_id"]; 
    providerId: ProviderDTO["_id"];
}


export type ProviderFetchDashboardGraphRepository = Omit<ProviderFetchDashboardGraphDataRequest, "subscription"> & {
    subscriptionGuard: number;
}