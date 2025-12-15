import Stripe from "stripe";
import { SubscriptionPlan } from "./common.dto";
import { User } from "../../domain/entities/user.entity";
import { Plan } from "../../domain/entities/plan.entity";
import { Review } from "../../domain/entities/review.entity";
import { Address } from "../../domain/entities/address.entity";
import { Service } from "../../domain/entities/service.entity";
import { Booking } from "../../domain/entities/booking.entity";
import { Provider } from "../../domain/entities/provider.entity";
import { ProviderService } from "../../domain/entities/providerService.entity";
import { FontendAvailabilityForResponse, FrontendAvailabilityForRequest } from "../../domain/entities/serviceAvailability.entity";


// ************ used in providerAddress.use-case ************ \\
// provider fetch address use case request payload interface
export interface ProviderFetchAddressRequest {
    providerId: Provider["_id"];
}
// provider fetch address use case response interface
export type ProviderFetchAddressResponse = Pick<Address, "_id" | "addressLine" | "landMark" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location"> | {};





// ************ used in providerService.use-case ************ \\

// provider fetch service details use case request payload
export interface ProviderFetchProviderServiceRequest {
    providerId: Provider["_id"];
}
// provider fetch service details use case respomse interface
type FindProviderServiceProps = Pick<ProviderService, "_id" | "serviceName" | "serviceDescription" | "servicePrice" | "isGroupService" | "maxParticipants" | "requirements" | "serviceExperience" | "serviceMode" | "serviceType" | "tags" | "videoUrl" | "updatedAt" | "createdAt">;
export interface ProviderFindProviderServiceResProps extends FindProviderServiceProps {
    service: Pick<Service, "serviceName">;
}
export type ProviderFetchProviderServiceResponse = ProviderFindProviderServiceResProps | {};





// ************ used in providerPlan.use-case ************ \\
// provider fetch all plans use case response interface 
export type ProviderFetchAllPlansResponse = Array<Pick<Plan, "_id" | "planName" | "price" | "features" | "description">> | [];





// ************ used in providerProfile.use-case ************ \\
// provider fetch profile detals use case request payload interface
export interface ProviderFetchProfileDetailsRequest {
    providerId: Provider["_id"];
}
// provider fetch profile detals use case response interface
export type ProviderFetchProfileDetailsResponse = Pick<Provider, "username" | "email" | "isAdminVerified" | "isBlocked" | "isEmailVerified" | "phone" | "createdAt"> | {};


// provider update profile image use case request payload interface
export type ProviderUpdateprofileImageRequestPayload = Pick<Provider, "profileImage"> & {
    providerId: Provider["_id"];
}
// provider update profile image use case response interface 
export type ProviderUpdateprofileImageResponse = Provider["profileImage"];


// provider update providerInfo request payload interface
export interface ProviderUpdateProviderInfoRequest {
    providerId: Provider["_id"];
    username: Provider["username"];
    phone: Provider["phone"];
}
// provider update provider info use case response interface
export type ProviderUpdateProviderInfoResponse = Pick<Provider, "username" | "phone">

// provider update identity proof request payload interface
export type ProviderUpdateIdentityProofRequest = Pick<Provider, "identityProof"> & {
    providerId: Provider["_id"];
}
// provider update service proof use case response interface
export type ProviderUpdateIdentityProofResponse = Provider["identityProof"];

// provider update identity proof request payload interface
export type ProviderUpdateServiceProofRequest = Pick<Provider, "serviceProof"> & {
    providerId: Provider["_id"];
}
// provider update service proof use case response interface
export type ProviderUpdateServiceProofResponse = Provider["serviceProof"];

export type ProviderUpdateProfileRequest = Pick<Provider,"_id"> & Partial<Pick<Provider, "username" | "profileImage" | "phone" | "identityProof" | "serviceProof" | "googleConnected" | "addressId" | "googleId" | "isAdminVerified" | "isEmailVerified" | "isBlocked" | "serviceAvailabilityId" | "serviceId" | "stripeAccountId" | "verificationToken" | "trustedBySlotflow" | "subscription" | "password">>

export interface ProviderAdminApprovalRequest {
    providerId: Provider["_id"];
}
export type ProviderAdminApprovalResponse = Pick<Provider, "adminVerificationStatus">; 




// ************ used in providerServiceAvailability ************ \\
// provider add service availability use case reques tpayload
export interface ProviderAddServiceAvailabilityRewuest {
    providerId: Provider["_id"];
    availabilities: FrontendAvailabilityForRequest[]
}


//  provider fetch service availability use case response interface 
export interface ProviderFetchServiceAvailabilityRequest {
    providerId: Provider["_id"];
    date: Date
}
//  provider fetch service availability use case response interface 
export type ProviderFetchServiceAvailabilityResponse = FontendAvailabilityForResponse | {};





// ************ used in providerStripeSubscription.use-case ************ \\
// provider stripe subscription create sessionId use case  request payload interface
export interface ProviderStripeSubscriptionCreateSessionIdRequest {
    providerId: Provider["_id"];
    planId: Plan["_id"];
    duration: string;
}
// provider stripe subscription create sessionId use case response interface
export type ProviderStripeSubscriptionCreateSessionIdResponse = string;


// provider save subscription after stripe payment use case request payload interface
export interface ProviderSaveSubscriptionRequest {
    providerId: Provider["_id"];
    sessionId: string
}
export interface ProviderSaveSubscriptionResponse {
    planName?: string
}; 





// ************ used in providerSubscription.use-case  ************ \\
// provider trial subscription use case reuest payload
export interface ProviderTrialSubscriptionRequest {
    providerId: Provider["_id"];
}





// ************ used in providerUser.use-case  ************ \\
// provider fetch users for the chat sidebar
export interface ProviderFetchUsersForChatSideBarRequest {
    providerId: Provider["_id"];
}
export type ProviderFetchUsersForChatSideBarResponse = Array<Pick<User, "_id" | "username" | "profileImage">>





// ************ used in providerDashboard.use-case  ************ \\
export interface ProviderFetchDashboardStatsDataRequest {
    providerId: Provider["_id"];
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
    providerId: Provider["_id"],
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
export type ProviderChangeBookingAppoinmentStatusRequest = Pick<Booking, "_id" | "appointmentStatus">;



// Provider Stripe UseCase
export interface ProviderStripeConnectRequest {
    providerId: Provider["_id"];
}
export type ProviderStripeConnectResponse = Stripe.Response<Stripe.AccountLink>;


// Provider Report UseCase
export interface ProviderRepostReviewRequest {
    reviewId: Review["_id"]; 
    providerId: Provider["_id"];
}