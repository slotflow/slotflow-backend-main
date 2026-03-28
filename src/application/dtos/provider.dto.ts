import { PlanName } from "../../domain/enums/plan.enum";
import { Review } from "../../domain/entities/review.entity";
import { ServiceCategory } from "../../domain/enums/service.enum";
import { BookingDTO, ProviderDTO, UserDTO, PlanDTO, AddressDTO, ServiceDTO, ProviderServiceDTO } from "./common.dto";

// provider fetch profile detals use case request payload interface
export interface ProviderFetchProfileDetailsRequest {
    providerId: ProviderDTO["_id"];
}
// provider fetch profile detals use case response interface
export type ProviderFetchProfileDetailsResponse = Pick<ProviderDTO, "username" | "email" | "isAdminVerified" | "isBlocked" | "isEmailVerified" | "phone" | "createdAt" | "trustedBySlotflow" | "updatedAt" | "adminVerificationStatus" | "isAddressVerified" | "isAvailabilityVerified" | "isProofsVerified" | "isServiceDetailsVerified"> | null;

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

// provider update profile request payload interface
export type ProviderUpdateProfileRequest = Pick<ProviderDTO, "_id"> & Partial<Pick<ProviderDTO, "username" | "profileImage" | "phone" | "identityProof" | "serviceProof" | "googleConnected" | "addressId" | "googleId" | "isAdminVerified" | "isEmailVerified" | "isBlocked" | "serviceAvailabilityId" | "serviceId" | "stripeAccountId" | "verificationToken" | "trustedBySlotflow" | "subscription" | "password">>

// provider admin approval
export interface ProviderAdminApprovalRequest {
    providerId: ProviderDTO["_id"];
}

// provider admin approval response interface
export type ProviderAdminApprovalResponse = Pick<ProviderDTO, "adminVerificationStatus">;

// provider delete proof request
export interface ProviderDeleteProofRequest {
    providerId: ProviderDTO["_id"];
}

// provider update push notification request payload interface
export interface ProviderUpdatePushNotificationRequest {
    providerId: ProviderDTO["_id"];
    allowPushNotification: boolean;
}

// provider fetch users for the chat sidebar
export interface ProviderFetchUsersForChatSideBarRequest {
    providerId: ProviderDTO["_id"];
}
// provider fetch users for the chat sidebar response interface
export type ProviderFetchUsersForChatSideBarResponse = Array<Pick<UserDTO, "_id" | "username" | "profileImage">>

// provider fetch dashboard stats data request payload interface
export interface ProviderFetchDashboardBookingStatsDataRequest {
    providerId: ProviderDTO["_id"];
    startDate: Date;
    endDate: Date;
}
// provider fetch dashboard stats data response interface
export interface ProviderFetchDashboardBookingStatsDataResponse {
    totalAppointments: number;
    completedAppointments: number;
    missedAppointments: number;
    cancelledAppointmentsByUser: number;
    rejectedAppointmentsByProvider: number;
    todaysAppointments: number;
}

// Used as the request interface for the provider fetch dashboard graph data
export interface FetchGraphDataRequest {
    providerId: ProviderDTO["_id"],
    subscription: PlanDTO["planName"],
    startDate?: Date,
    endDate?: Date,
}

// Used as the return interface for the provider fetch dashboard graph data
export interface FetchGraphDataResponse {
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

// Used as the request type for the provider change booking appointment status
export type ProviderChangeBookingAppoinmentStatusRequest = Pick<BookingDTO, "_id" | "appointmentStatus"> & {
    providerId: ProviderDTO["_id"];
};

// Provider Report UseCase
export interface RepostReviewRequest {
    reviewId: Review["_id"];
    providerId: ProviderDTO["_id"];
}

// provider fetch dashboard graph repository interface
export type ProviderFetchDashboardGraphRepository = Omit<FetchGraphDataRequest, "subscription"> & {
    subscriptionGuard: number;
}

// populated plan interface
export interface PopulatedPlan {
    subscriptionPlanId: {
        planName: PlanName;
    }
}

// user fetch service provider details request payload interface
export interface UserFetchServiceProviderDetailsRequest {
    providerId: string;
}

// user fetch service provider details response interface
export type UserFetchServiceProviderDetailsResponse = Pick<ProviderDTO, "username" | "email" | "phone" | "profileImage" | "trustedBySlotflow">;

// get providers by filter request payload interface
export interface GetProvidersByFilterRequest {
    serviceIds?: string[];
    categories?: ServiceCategory[];
    location?: AddressDTO["location"];
    maxPrice?: number;
    minPrice?: number;
    slotflowTrusted?: boolean;
    radius?: number;
    skip?: number;
    limit?: number;
};

// find providers using service ids response interface
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

// get providers by filter response interface
export type GetProvidersByFilterResponse = FindProvidersUsingServiceIdsResponse

// get providers for chat request payload interface
export interface GetProvidersForChatRequest {
    userId: string
}

// get providers for chat response interface
export type GetProvidersForChatResponse = Array<Pick<ProviderDTO, "_id" | "username" | "profileImage">>;


