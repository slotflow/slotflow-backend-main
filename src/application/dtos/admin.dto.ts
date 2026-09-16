import { CommonDateInput, ProviderProfileDTO, ReviewDTO, UserDTO } from "./common.dto";
import { BookingsStatsDataAdminQuery, BookingsStatsDataAdminView } from "./booking.dto";
import { SubscriptionStatsDataQuery, SubscriptionStatsDataView } from "./subscription.dto";
import { ProviderStatsDataQuery, ProviderStatsDataView, UserChartDataQuery, UserChartDataView, UserStatsDataQuery, UserStatsDataView } from "./user.dto";

//// **** admin dtos **** ////

// GetUserData usecase input output
export type GetUserStatsDataInput = UserStatsDataQuery;
export type GetUserStatsDataOutput = UserStatsDataView;


// GetProviderData usecase input output
export type GetProviderDataInput = ProviderStatsDataQuery; 
export type GetProviderDataOutput = ProviderStatsDataView; 


// GetSubscriptionData usecase input output
export type GetSubscriptionStatsDataInput = SubscriptionStatsDataQuery;
export type GetSubscriptionStatsDataOutput = SubscriptionStatsDataView;


// GetBookingsData usecase input output
export type GetBookingsDataInput = BookingsStatsDataAdminQuery;
export type GetBookingsDataOutput = BookingsStatsDataAdminView ;


// AdminApproveProvider usecase input output
export interface AdminApproveProviderInput {
    providerId: UserDTO["_id"];
}
export type AdminApproveProviderOutput = Pick<UserDTO, "_id"> & Pick<ProviderProfileDTO, "isAdminVerified" | "adminVerificationStatus">;


// Reject provider ( by admin )
export type AdminRejectProviderInput = Pick<ProviderProfileDTO, "verificationRejectionReason" | "isAddressVerified" | "isServiceDetailsVerified" | "isAvailabilityVerified" | "isProofsVerified"> & {
    providerId: UserDTO["_id"];
};
export type AdminRejectProviderOutput = Pick<UserDTO, "_id"> & Pick<
  ProviderProfileDTO,
  | 'isAddressVerified'
  | 'isServiceDetailsVerified'
  | 'isAvailabilityVerified'
  | 'isProofsVerified'
>;


// Change provider block status ( by admin )
export interface AdminChangeProviderBlockStatusInput {
    providerId: UserDTO["_id"];
    isBlocked: UserDTO["isBlocked"];
};
export type AdminChangeProviderBlockStatusOutput = Pick<UserDTO, "_id" | "isBlocked">;


// Change provider trust tag ( by admin )
export interface AdminChangeProviderTrustTagInput {
    providerId: UserDTO["_id"];
    trustedBySlotflow: ProviderProfileDTO["trustedBySlotflow"];
};
export type AdminChangeProviderTrustTagOutput = Pick<UserDTO, "_id"> & Pick<ProviderProfileDTO, "trustedBySlotflow">;


// ToggleReviewBlockStatus usecase input output
export interface ChangeReviewBlockStatusInput {
    reviewId: ReviewDTO["_id"];
    isBlocked: ReviewDTO["isBlocked"];
};
export type ChangeReviewBlockStatusOutput = Pick<ReviewDTO, "_id" | "isBlocked">;

// GetGraphData usecase input output
export interface GetGraphDataInput extends CommonDateInput { }
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