import { CommonDateInput } from "./common.dto";
import { UserProps } from "../../domain/contracts/user.contract";
import { ReviewProps } from "../../domain/contracts/review.contract";
import { ProviderProfileProps } from "../../domain/contracts/providerProfile.contract";
import { BookingsStatsDataAdminQuery, BookingsStatsDataAdminView } from "./booking.dto";
import { SubscriptionStatsDataQuery, SubscriptionStatsDataView } from "./subscription.dto";
import { ProviderStatsDataQuery, ProviderStatsDataView, UserChartDataQuery, UserChartDataView, UserStatsDataQuery, UserStatsDataView } from "./user.dto";

/**
 * Admin usecase dtos
 */

// GetUserData
export type GetUserStatsDataInput = UserStatsDataQuery;
export type GetUserStatsDataOutput = UserStatsDataView;


// GetProviderData
export type GetProviderDataInput = ProviderStatsDataQuery; 
export type GetProviderDataOutput = ProviderStatsDataView; 


// GetSubscriptionData
export type GetSubscriptionStatsDataInput = SubscriptionStatsDataQuery;
export type GetSubscriptionStatsDataOutput = SubscriptionStatsDataView;


// GetBookingsData
export type GetBookingsDataInput = BookingsStatsDataAdminQuery;
export type GetBookingsDataOutput = BookingsStatsDataAdminView ;


// AdminApproveProvider
export interface AdminApproveProviderInput {
    providerId: UserProps["_id"];
}
export type AdminApproveProviderOutput = Pick<UserProps, "_id"> & Pick<ProviderProfileProps, "isAdminVerified" | "adminVerificationStatus">;


// Reject provider ( by admin )
export type AdminRejectProviderInput = Pick<ProviderProfileProps, "verificationRejectionReason" | "isAddressVerified" | "isServiceDetailsVerified" | "isAvailabilityVerified" | "isProofsVerified"> & {
    providerId: UserProps["_id"];
};
export type AdminRejectProviderOutput = Pick<UserProps, "_id"> & Pick<
  ProviderProfileProps,
  | 'isAddressVerified'
  | 'isServiceDetailsVerified'
  | 'isAvailabilityVerified'
  | 'isProofsVerified'
>;


// Change provider block status ( by admin )
export type AdminChangeProviderBlockStatusInput = Pick<UserProps, "isBlocked"> & {
    providerId: UserProps["_id"];
};
export type AdminChangeProviderBlockStatusOutput = Pick<UserProps, "_id" | "isBlocked">;


// Change provider trust tag ( by admin )
export type AdminChangeProviderTrustTagInput = Pick<ProviderProfileProps, "trustedBySlotflow"> & {
    providerId: UserProps["_id"];
};
export type AdminChangeProviderTrustTagOutput = Pick<UserProps, "_id"> & Pick<ProviderProfileProps, "trustedBySlotflow">;


// ToggleReviewBlockStatus
export type ChangeReviewBlockStatusInput = Pick<ReviewProps, "isBlocked"> & {
    reviewId: ReviewProps["_id"];
};
export type ChangeReviewBlockStatusOutput = Pick<ReviewProps, "_id" | "isBlocked">;


// GetGraphData
export interface GetGraphDataInput extends CommonDateInput {
    timeZone: string;
}
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

// get user chart data
export type GetUserChartDataInput = UserChartDataQuery; 
export type GetUserChartDataOutput = UserChartDataView;