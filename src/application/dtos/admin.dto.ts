import { UserDataQuery, UserDataView } from "./user.dto";
import { ProviderProfileDTO, ReviewDTO, UserDTO } from "./common.dto";
import { SubscriptionStatsForAdminQuery, SubscriptionStatsForAdminView } from "./subscription.dto";

//// **** admin dtos **** ////

// GetStatsDataCommon usecase input output
export interface GetStatsDataCommonInput {
    startDate: Date;
    endDate: Date;
}

// GetBookingsData usecase input output
export interface GetBookingsDataInput extends GetStatsDataCommonInput { }
export interface GetBookingsDataOutput {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    missedAppointments: number;
    rejectedAppointments: number;
};

// AdminApproveProvider usecase input
export interface AdminApproveProviderInput {
    providerId: UserDTO["_id"];
};

// AdminRejectProvider usecase input
export type AdminRejectProviderInput = Pick<ProviderProfileDTO, "verificationRejectionReason" | "isAddressVerified" | "isServiceDetailsVerified" | "isAvailabilityVerified" | "isProofsVerified"> & {
    providerId: UserDTO["_id"];
};

// AdminChangeProviderBlockStatus usecase input output
export interface AdminChangeProviderBlockStatusInput {
    providerId: UserDTO["_id"];
    isBlocked: UserDTO["isBlocked"];
};
export type AdminChangeProviderBlockStatusOutput = AdminChangeProviderBlockStatusInput;

// AdminChangeProviderTrustTag usecase input output
export interface AdminChangeProviderTrustTagInput {
    providerId: UserDTO["_id"];
    trustedBySlotflow: ProviderProfileDTO["trustedBySlotflow"];
};
export type AdminChangeProviderTrustTagOutput = AdminChangeProviderTrustTagInput;

// ToggleReviewBlockStatus usecase input output
export interface ToggleReviewBlockStatusInput {
    reviewId: ReviewDTO["_id"];
    isBlocked: ReviewDTO["isBlocked"];
};
export type ToggleReviewBlockStatusOutput = ToggleReviewBlockStatusInput;

// GetGraphData usecase input output
export interface GetGraphDataInput extends GetStatsDataCommonInput { }
export interface GetGraphDataOutput {
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
        status: 'completed' | 'missed' | 'cancelled' | 'rejected' | "confirmed" | "booked" | "pending";
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

// GetSubscriptionData usecase input output
export type GetSubscriptionDataInput = SubscriptionStatsForAdminQuery;
export type GetSubscriptionDataOutput = SubscriptionStatsForAdminView;

// GetUserData usecase input output
export type GetUserDataInput = UserDataQuery;
export type GetUserDataOutput = UserDataView;