import { AddressDTO, ProviderProfileDTO, ReviewDTO, ServiceDTO, UserDTO } from "./common.dto";

// Used as the request type of admin get dashboard stats data
export interface GetStatsDataCommonInput {
    startDate: Date;
    endDate: Date;
}

// Used as the request type of admin get dashboard appointments stats data
export interface GetBookingsDataInput extends GetStatsDataCommonInput { }

// used as the return type of the admin get dashboard appointments stats data
export interface GetBookingsDataOutput {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    missedAppointments: number;
    rejectedAppointments: number;
};

// Used as the request interface of admin approve provider
export interface AdminApproveProviderInput {
    providerId: UserDTO["_id"];
};
// Used as the request interface of admin reject provider
export type AdminRejectProviderInput = Pick<ProviderProfileDTO, "verificationRejectionReason" | "isAddressVerified" | "isServiceDetailsVerified" | "isAvailabilityVerified" | "isProofsVerified"> & {
    providerId: UserDTO["_id"];
};

// Used as the request interface of admin change provider block status
export interface AdminChangeProviderBlockStatusInput {
    providerId: UserDTO["_id"];
    isBlocked: UserDTO["isBlocked"];
};
// Used as the response type of admin change provider block status
export type AdminChangeProviderBlockStatusOutput = AdminChangeProviderBlockStatusInput;

// Used as the request interface of admin change provider trust tag 
export interface AdminChangeProviderTrustTagInput {
    providerId: UserDTO["_id"];
    trustedBySlotflow: ProviderProfileDTO["trustedBySlotflow"];
};
// Used as the response type of admin change provider trust tag 
export type AdminChangeProviderTrustTagOutput = AdminChangeProviderTrustTagInput;

// Used as the request interface of admin chage review block status
export interface ToggleReviewBlockStatusInput {
    reviewId: ReviewDTO["_id"];
    isBlocked: ReviewDTO["isBlocked"];
};
// Used as the response interface of admin chage review block status
export type ToggleReviewBlockStatusOutput = ToggleReviewBlockStatusInput;