import { CommonDateInput } from "./common.dto";
import { Role } from "../../domain/enums/common.enum";
import { ServiceMode } from "../../domain/enums/service.enum";
import { UserProps } from "../../domain/contracts/user.contract";
import { BookingProps } from "../../domain/contracts/booking.contract";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { ApiPaginationInput, Availability,  StatMetric, TimeSlotForClientOutput } from "./common.dto";
import { ParticipantPresence } from "../../domain/commands/booking.commands";

/**
 * Booking queries dtos
 */

// findAll method 
export interface BookingsQuery extends ApiPaginationInput {
  online: boolean;
  role: Role;
  userId?: UserProps["_id"];
  serviceProviderId?: UserProps["_id"];
}
export type BookingsView = BookingsBaseView | OnlineBookingsViewForProvider | OnlineBookingsViewForUser;
export type BookingsBaseView = Array<Pick<BookingProps, "_id" | "appointmentDate" | "appointmentMode" | "appointmentStatus" | "appointmentTime" | "createdAt" | "videoCallRoomId" | "serviceProviderId">>;
export type OnlineBookingsViewForProvider = Array<
  Pick<
    BookingProps,
    | "_id"
    | "appointmentDate"
    | "appointmentStatus"
    | "appointmentTime"
    | "videoCallRoomId"
    | "createdAt"
  > & {
    userId: Pick<UserProps, "username">;
  }
>;
export type OnlineBookingsViewForUser = Array<
  Pick<
    BookingProps,
    | "_id"
    | "appointmentDate"
    | "appointmentStatus"
    | "appointmentTime"
    | "videoCallRoomId"
    | "createdAt"
  > & {
    serviceProviderId: Pick<UserProps, "username">;
  }
>;


// findDetails method
export interface BookingDetailsQuery {
  bookingId: BookingProps["_id"];
}
export interface BookingDetailsView extends Pick<BookingProps, "appointmentDate" | "appointmentMode" | "appointmentStatus" | "appointmentTime" | "createdAt" | "onlineTrack" | "statusTrack" | "videoCallRoomId"> {
  userId: Pick<UserProps, "username" | "email">;
  serviceProviderId: Pick<UserProps, "username" | "email">;
};


// findUsersforChatSideBar method 
export type BookingUsersForChatQuery = Pick<UserProps, "role"> & {
  userId: UserProps["_id"];
  // need to send the opposite role
}
export type BookingUsersForChatView = Array<Pick<UserProps, "_id" | "username" | "profileImage">>;


// findStatsDataForProviderDashboard method 
export interface BookingStatsForProviderQuery {
  providerId: UserProps["_id"];
  startDate: Date;
  endDate: Date;
}
export interface BookingStatsForProviderView extends Record<string, StatMetric | undefined> {
  totalAppointments: StatMetric;
  completedAppointments: StatMetric;
  missedAppointments: StatMetric;
  cancelledAppointmentsByUser: StatMetric;
  rejectedAppointmentsByProvider: StatMetric;
  todaysAppointments: StatMetric;
}


// findGraphDataForProviderDashboard method
export interface BookingGraphStatsForProviderQuery {
  subscriptionGuard?: number;
  providerId?: UserProps["_id"];
  startDate: Date;
  endDate: Date;
  isAdmin: boolean;
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


// findStatsDataForAdminDashboard method 
export interface BookingsStatsDataAdminQuery extends CommonDateInput { }
export interface BookingsStatsDataAdminView extends Record<string, StatMetric | undefined> {
  totalAppointments: StatMetric;
  completedAppointments: StatMetric;
  cancelledAppointments: StatMetric;
  missedAppointments: StatMetric;
  rejectedAppointments: StatMetric;
};





/**
 * Booking usecase dtos
 */

// user appointment booking via stripe creating session id
export interface UserAppointmentBookingViaStripeInput {
  userId: UserProps["_id"];
  providerId: UserProps["_id"];
  slotId: TimeSlotForClientOutput["_id"];
  selectedServiceMode: ServiceMode;
  date: string;
  email: string;
  name: string;
  role: Role;
}
export interface UserAppointmentBookingViaStripeOutput {
  sessionId: string;
}


// user canncel booking
export interface UserCancelBookingInput {
  userId: UserProps["_id"];
  bookingId: BookingProps["_id"];
  reason?: string;
}
export type UserCancelBookingOutput = Pick<BookingProps, "_id" | "appointmentStatus">;


// provider change booking appointment status
export interface ProviderChangeBookingAppointmentStatusInput {
  bookingId: BookingProps["_id"];
  providerId: UserProps["_id"];
  appointmentStatus: AppointmentStatus;
};
export type ProviderChangeBookingAppointmentStatusOutput = Pick<BookingProps, "_id" | "appointmentStatus">;


// check booking
export interface CheckBookingInput {
  userId: UserProps["_id"];
}


// get booking details 
export type GetBookingDetailsInput = BookingDetailsQuery;
export type GetBookingDetailsOutput = BookingDetailsView;


// get bookings
export type GetBookingsInput = BookingsQuery;
export type GetBookingsOutput = BookingsView;


// update booking online tracking
export interface UpdateBookingOnlineTrackInput extends ParticipantPresence {
  role: Role;
  roomId: BookingProps["videoCallRoomId"];
}
export type UpdateBookingOnlineTrackOutput = Pick<Availability, "duration"> & Pick<BookingProps, "videoCallRoomId">;


// validate join room 
export interface ValidateJoinRoomInput {
  role: Role;
  bookingId: BookingProps["_id"];
  roomId: BookingProps["videoCallRoomId"];
  userId: UserProps["_id"];
};