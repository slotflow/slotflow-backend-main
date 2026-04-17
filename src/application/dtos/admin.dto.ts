import { ProviderProfileDTO, ReviewDTO, UserDTO } from "./common.dto";

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