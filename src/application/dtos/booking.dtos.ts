import { Role } from "../../domain/enums/common.enum";
import { GetStatsDataCommonRequest } from "./admin.dto";
import { ServiceMode } from "../../domain/enums/service.enum";
import { ApiPaginationRequest, Availability, BookingDTO, ParticipantPresence, PlanDTO, TimeSlotForFrontendResponse, UserDTO } from "./common.dto";

//// **** booking queries dtos **** ////

// 1. findAll methods parameter and return types / interface
export interface BookingsQuery extends ApiPaginationRequest {
  online: boolean;
  role: Role;
  userId?: UserDTO["_id"];
  serviceProviderId?: UserDTO["_id"];
}
export type BookingsView = BookingsBaseView | OnlineBookingsViewForProvider | OnlineBookingsViewForUser;
export type BookingsBaseView = Array<Pick<BookingDTO, "_id" | "appointmentDate" | "appointmentMode" | "appointmentStatus" | "appointmentTime" | "createdAt" | "videoCallRoomId" | "serviceProviderId">>;
export type OnlineBookingsViewForProvider = Array<
  Pick<
    BookingDTO,
    | "_id"
    | "appointmentDate"
    | "appointmentStatus"
    | "appointmentTime"
    | "videoCallRoomId"
    | "createdAt"
  > & {
    userId: Pick<UserDTO, "username">;
  }
>;
export type OnlineBookingsViewForUser = Array<
  Pick<
    BookingDTO,
    | "_id"
    | "appointmentDate"
    | "appointmentStatus"
    | "appointmentTime"
    | "videoCallRoomId"
    | "createdAt"
  > & {
    serviceProviderId: Pick<UserDTO, "username">;
  }
>;


// 2. findDetails methods parameter and return type / interface
export interface BookingDetailsQuery {
    bookingId: BookingDTO["_id"];
}
export interface BookingDetailsView extends Pick<BookingDTO, "appointmentDate" | "appointmentMode" | "appointmentStatus" | "appointmentTime" | "createdAt" | "onlineTrack" | "statusTrack" | "videoCallRoomId"> {
  userId: Pick<UserDTO, "username" | "email">;
  serviceProviderId: Pick<UserDTO, "username" | "email">;
};

// 3. findUsersforChatSideBar methods parameter and return type / interface
export interface BookingUsersForChatQuery {
    userId: UserDTO["_id"];
    role: Role; // need to send the opposite role
}
export type BookingUsersForChatView = Array<Pick<UserDTO, "_id" | "username" | "profileImage">>;

// 4. findStatsDataForProviderDashboard methods parameter and return type / interface
export interface BookingStatsForProviderQuery {
    providerId: UserDTO["_id"];
    startDate: Date;
    endDate: Date;
}
export interface BookingStatsForProviderView {
    totalAppointments: number;
    completedAppointments: number;
    missedAppointments: number;
    cancelledAppointmentsByUser: number;
    rejectedAppointmentsByProvider: number;
    todaysAppointments: number;
}

// 5. findGraphDataForProviderDashboard methods parameter and return type / interface
export interface GetGraphData {
    providerId: UserDTO["_id"],
    subscription: PlanDTO["planName"],
    startDate?: Date,
    endDate?: Date,
}
export type BookingGraphStatsForProviderQuery = Omit<GetGraphData, "subscription"> & {
    subscriptionGuard: number;
}
export interface BookingGraphStatsForProviderView {
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

// 6. findStatsDataForAdminDashboard methods parameter and return type / interface
export interface BookingsStatsForAdminQuery extends GetStatsDataCommonRequest {}
export interface BookingsStatsForAdminView {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    missedAppointments: number;
    rejectedAppointments: number;
};











//// **** booking usecase dtos **** ////

// user appointment booking via stripe creating session id usecase input
export interface UserAppointmentBookingViaStripeInput {
    userId: UserDTO["_id"];
    providerId: UserDTO["_id"];
    slotId: TimeSlotForFrontendResponse["_id"];
    selectedServiceMode: ServiceMode;
    date: Date
}

// user canncel booking usecase input
export interface UserCancelBookingInput {
    userId: UserDTO["_id"];
    bookingId: BookingDTO["_id"];
}

// provider change booking appointment status usecase input
export type ProviderChangeBookingAppointmentStatusInput = Pick<BookingDTO, "_id" | "appointmentStatus"> & {
    providerId: UserDTO["_id"];
};

// check booking usecase input
export interface CheckBookingInput {
    userId: UserDTO["_id"];
}

// get booking details usecase input and output
export type GetBookingDetailsInput = BookingDetailsQuery;
export type GetBookingDetailsOutput = BookingDetailsView;

// get bookings usecase input and output
export type GetBookingsInput = BookingsQuery; 
export type GetBookingsOutput = BookingsView;

// update booking online tracking usecase input and output
export interface UpdateBookingOnlineTrackInput extends ParticipantPresence {
  role: Role;
  roomId: BookingDTO["videoCallRoomId"];
}
export type UpdateBookingOnlineTrackOutput = Pick<Availability, "duration">;

// validate join room usecase input and output
export interface ValidateJoinRoomInput {
  role: Role;
  bookingId: BookingDTO["_id"];
  roomId: BookingDTO["videoCallRoomId"];
  userId: UserDTO["_id"];
};