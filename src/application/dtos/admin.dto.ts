import { AddressDTO, ApiPaginationRequest, FontendAvailabilityForResponse, PaymentDTO, PlanDTO, ProviderDTO, ProviderServiceDTO, ReviewDTO, ServiceDTO, SubscriptionDTO, UserDTO } from "./common.dto";

// **** adminAddress.usecase

// Used as the request type of admin fetch provider address
export type AdminFetchUserOrProviderAddressResponse = Pick<AddressDTO, "userId" | "addressLine" | "phone" | "place" | "city" | "district" | "pincode" | "state" | "country" | "location"> | null;





// **** adminDashboard.usecase

// used as the return type of the admin fetch dashboard todays stats data
export interface AdminFetchDashboardTodayStatsDataResponse {
  newUsers: number;
  newProviders: number;

  todaysTotalRevenue: number;
  todaysTotalPayouts: number;

  todaysAppointments: number;
  todaysCancelledAppointments: number;
  todaysCompletedAppointments: number;
};

// used as the return type of the admin fetch dashboard user stats data
export interface AdminFetchDashboardUserStatsDataResponse {
    totalUsers: number;
    emailVerifiedUsers: number;
    blockedUsers: number;
};

// used as the return type of the admin fetch dashboard provider stats data
export interface AdminFetchDashboardProviderStatsDataResponse {
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
export interface AdminFetchDashboardSubscriptionStatsDataResponse {
    activeSubscriptions: number;
    expiredSubscriptions: number;
    subscriptionsByFreePlan: number;
    subscriptionsByStarterPlan: number;
    subscriptionsByProfessionalPlan: number;
    subscriptionsByEnterprisePlan: number;
};

// used as the return type of the admin fetch dashboard revenue stats data
export interface AdminFetchDashboardRevenueStatsDataResponse {
    totalRevenue: number;
    totalRevenueViaSubscriptions: number;
    revenueByStripe: number;
    revenueByRazorpay: number;
    revenueByPaypal: number;
    totalRevenueViaAppointments: number;
    totalRefundsIssued: number;
    totalFailedPayments: number;
    totalPayoutsToProviders: number;
};

// used as the return type of the admin fetch dashboard appointments stats data
export interface AdminFetchDashboardAppointmentStatsDataResponse {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    missedAppointments: number;
    rejectedAppointments: number;
};





// **** adminPayment.usecase

// Admin fetch revenue report request
export interface AdminFetchRevenueReportRequest extends ApiPaginationRequest {
    startDate?: Date;
    endDate: Date;
};

// Admin fetch revenue report response
export type AdminFetchRevenueReportRow = Pick<
  PaymentDTO,
  | "createdAt"
  | "discountAmount"
  | "initialAmount"
  | "totalAmount"
  | "paymentGateway"
  | "paymentFor"
>;
export interface AdminFetchRevenueReportResponse {
  rows: AdminFetchRevenueReportRow[];
  grandTotal: number;
  grandDiscount: number;
  grandInitalAmount: number;
};





// **** adminPlan.usecase

// Used as the return type of fetch all plans
export type AdminPlanListResponse = Array<Pick<PlanDTO, "_id" | "planName" | "isBlocked" | "price" | "maxBookingPerMonth" | "adVisibility">>;

// admin create new plan request payload type 
export type AdminCreatePlanRequest = Pick<PlanDTO, "planName" | "description" | "price" | "features" | "maxBookingPerMonth" | "adVisibility">;

// Used as the return type of admin change plan block status
export type AdminChangeBlockStatusResponse = {
    planId: PlanDTO["_id"];
    isBlocked: PlanDTO["isBlocked"];
};

// admin change plan block status request payload type
export type AdminChangePlanIsBlockedStatusRequest = AdminChangeBlockStatusResponse;





// **** adminProvider.usecase

// Used as the response type of admin fetch all providers
export type AdiminFetchAllProviders = Array<Pick<ProviderDTO, "_id" | "username" | "email" | "isBlocked" | "isAdminVerified" | "isEmailVerified" | "trustedBySlotflow" | "adminVerificationStatus">>;

// Used as the request interface of admin approve provider
export interface AdminApproveProviderRequest  {
    providerId: ProviderDTO["_id"];
};
// Used as the request interface of admin reject provider
export type AdminRejectProviderRequest = Pick<ProviderDTO, "verificationRejectionReason" | "isAddressVerified" | "isServiceDetailsVerified" | "isAvailabilityVerified" | "isProofsVerified"> & {
    providerId: ProviderDTO["_id"];
};

// Used as the request interface of admin change provider block status
export interface AdminChangeProviderStatusRequest {
    providerId: ProviderDTO["_id"];
    isBlocked: ProviderDTO["isBlocked"];
};
// Used as the response type of admin change provider block status
export type AdminChangeProviderStatusResponse = AdminChangeProviderStatusRequest;

// Used as the request interface of admin change provider trust tag 
export interface AdminChangeProviderTrustTagRequest  {
    providerId: ProviderDTO["_id"];
    trustedBySlotflow: ProviderDTO["trustedBySlotflow"];
};
// Used as the response type of admin change provider trust tag 
export type AdminChangeProviderTrustTagResponse = AdminChangeProviderTrustTagRequest;





// **** adminProviderProfile.usecase

// Used as the request interface of admin fetch provider profile details
export interface AdminFetchProviderDetailsRequest {
    providerId: ProviderDTO["_id"];
}
// Used as the return type of admin fetch provider profile details
export type AdminFetchProviderDetailsResponse = Pick<ProviderDTO, "_id" | "username" | "email" | "isBlocked" | "isEmailVerified" | "isAdminVerified" | "phone" | "profileImage" | "trustedBySlotflow" | "createdAt"> | null;

// Used as the request interface of admin fetch provider service
export type AdminFetchProviderServiceRequest = {
    providerId: ProviderDTO["_id"];
};
// Used as the request interface of admin fetch provider service
type FindProviderServiceProps = Omit<ProviderServiceDTO, "service">;
export interface FindProviderServiceResponse extends FindProviderServiceProps {
    service: Pick<ServiceDTO, "serviceName">
};
export type AdminFetchProviderServiceResponse = FindProviderServiceResponse | null;

// Used as the request interface of admin fetch provider service availability
export interface AdminFetchProviderServiceAvailabilityRequest {
    providerId: ProviderDTO["_id"];
    date: Date
}
// Used as the return interface of admin fetch provider service availability
export type AdminFetchProviderServiceAvailabilityResponse = FontendAvailabilityForResponse | null;














// **************** used in adminProvider.use-case **************** \\

// **** adminFetchAllProviders

// **** adminApproveProvider

// **** adminRejectProvider

// **** adminChangeProvierBlockStatus

// **** adminChangeProviderTrustTag

// **** adminFetchProviderProfileDetails




// **** adminFetchProviderAddress





// **** adminFetchProviderServiceAvailability




// **************** used in adminUser.use-case **************** \\

type AdminUserBaseInfo = Pick<UserDTO, "_id" | "username" | "email" | "isBlocked" | "isEmailVerified">;

// **** adminFetchAllUsers
// Used as the return type of fetch all users
// Used in AdminUserListUseCase, the findAllUsers method in UserRepositoryImpl, 
// and the findAllUsers method in IUserRepository as the response type with the ApiResponse interface
export type AdminFetchAllUsers = Array<AdminUserBaseInfo>;



// **** adminChangeUserBlockStatus
// Used as the request interface of admin change block status of user  
export interface AdminChangeUserIsBlockedStatusRequest {
    userId: UserDTO["_id"];
    isBlocked: UserDTO["isBlocked"];
}

// **** AdminFetchUserDetailsUseCase
// Used as the request interface of admin fetch user profile details
export interface AdminFetchUserProfileDetailsRequest {
    userId: UserDTO["_id"];
}
// Used as the response type of admin fetch user profile details
export type AdminFetchUserProfileDetailsResponse = Pick<UserDTO, "username" | "phone" | "profileImage" | "isEmailVerified" | "isBlocked" | "email" | "createdAt"> | {};





// **************** used in adminService.use-case **************** \\

// **** adminFetchAllServices
// Used as the request interface of admin fetch all app services
export type AdminServiceListResponse = Array<Pick<ServiceDTO, "_id" | "serviceName" | "isBlocked">>;

// admin add new service use case request payload interface
export type AdminAddServiceRequest = Pick<ServiceDTO, "serviceName" | "serviceCategory">; 


// admin change service isBlocked status use case request payload interface
export interface AdminChnageServiceIsBlockedStatusRequest {
    serviceId: ServiceDTO["_id"];
    isBlocked: ServiceDTO["isBlocked"];
}










// **** used in adminSubscription.use-case **** \\

// Admin fetch all subscriptions use case response interface 
// export type AdminFetchAllSubscriptionsResponse = Array<Pick<Subscription, "_id" | "createdAt" | "providerId" | "startDate" | "endDate" | "subscriptionStatus">>;
export type AdminFetchAllSubscriptionsResponse = Array<Pick<SubscriptionDTO, "_id" | "startDate" | "endDate" | "subscriptionStatus"> & Pick<PlanDTO, "planName">>;



// Admin Review UseCase
export interface AdminUpdateReviewBlockStatusRequest {
    reviewId: ReviewDTO["_id"];
}








// **** used in adminPlan.use-case **** \\






// **** used in adminDashboard.use-case **** \\













export type AdminFetchTodaysBookingStatsForDashboardResponse = Pick<AdminFetchDashboardTodayStatsDataResponse, "todaysAppointments" | "todaysCancelledAppointments" | "todaysCompletedAppointments">;

export type AdminFetchDashboardTodayPaymentStatsDataResponse = Pick<AdminFetchDashboardTodayStatsDataResponse, "todaysTotalPayouts" | "todaysTotalRevenue">;