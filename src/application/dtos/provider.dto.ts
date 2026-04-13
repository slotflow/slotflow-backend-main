import { PlanName } from "../../domain/enums/plan.enum";
import { Review } from "../../domain/entities/review.entity";
import { ServiceCategory } from "../../domain/enums/service.enum";
import { BookingDTO, UserDTO, PlanDTO, AddressDTO, ServiceDTO, ProviderServiceDTO, ProviderProfileDTO } from "./common.dto";
import { Role } from "../../domain/enums/common.enum";

// provider update profile request payload interface
export type ProviderUpdateProfileRequest = Pick<UserDTO, "_id" | "username" | "profileImage" | "phone" | "addressId" | "googleConnected" | "googleId" | "isBlocked" | "stripeAccountId" > & Partial<Pick<ProviderProfileDTO, "identityProof" | "serviceProof" | "isAdminVerified" | "serviceAvailabilityId" | "serviceId" | "trustedBySlotflow" | "subscription">>


// provider get users for the chat sidebar
export interface ProviderGetUsersForChatSideBarRequest {
    userId: UserDTO["_id"];
    role: Role;
}
// provider get users for the chat sidebar response interface
export type ProviderGetUsersForChatSideBarResponse = Array<Pick<UserDTO, "_id" | "username" | "profileImage">>

// provider get dashboard stats data request payload interface
export interface ProviderGetDashboardBookingStatsDataRequest {
    providerId: UserDTO["_id"];
    startDate: Date;
    endDate: Date;
}
// provider get dashboard stats data response interface
export interface ProviderGetDashboardBookingStatsDataResponse {
    totalAppointments: number;
    completedAppointments: number;
    missedAppointments: number;
    cancelledAppointmentsByUser: number;
    rejectedAppointmentsByProvider: number;
    todaysAppointments: number;
}

// Used as the return interface for the provider get dashboard graph data
export interface GetGraphDataResponse {
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



// Provider Report UseCase
export interface RepostReviewRequest {
    reviewId: Review["_id"];
    providerId: UserDTO["_id"];
}

// populated plan interface
export interface PopulatedPlan {
    subscriptionPlanId: {
        planName: PlanName;
    }
}

// user get service provider details request payload interface
export interface UserGetServiceProviderDetailsRequest {
    providerId: string;
}

// user get service provider details response interface
export type UserGetServiceProviderDetailsResponse = Pick<UserDTO, "username" | "email" | "phone" | "profileImage"> & Pick<ProviderProfileDTO, "trustedBySlotflow">;

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




// admin get provider details request payload interface
export interface AdminGetProviderDetailsRequest {
    providerId: UserDTO["_id"];
}

// admin get provider details response interface
export type AdminGetProviderDetailsResponse = Pick<UserDTO, "_id" | "username" | "email" | "phone" | "createdAt" | "profileImage" | "isBlocked"> & Pick<ProviderProfileDTO, "adminVerificationStatus" | "isAddressVerified" | "isAdminVerified" | "isAvailabilityVerified" | "isProofsVerified" | "isServiceDetailsVerified" | "trustedBySlotflow"> | null;