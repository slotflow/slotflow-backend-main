import { CommonDateInput } from "./common.dto";
import { Role } from "../../domain/enums/common.enum";
import { ServiceMode } from "../../domain/enums/service.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { ApiPaginationInput, Availability, BookingDTO, ParticipantPresence, StatMetric, TimeSlotForClientOutput, UserDTO } from "./common.dto";

//// **** booking queries dtos **** ////

// 1. findAll method parameter and return types / interface
export interface BookingsQuery extends ApiPaginationInput {
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


// 2. findDetails method parameter and return type / interface
export interface BookingDetailsQuery {
  bookingId: BookingDTO["_id"];
}
export interface BookingDetailsView extends Pick<BookingDTO, "appointmentDate" | "appointmentMode" | "appointmentStatus" | "appointmentTime" | "createdAt" | "onlineTrack" | "statusTrack" | "videoCallRoomId"> {
  userId: Pick<UserDTO, "username" | "email">;
  serviceProviderId: Pick<UserDTO, "username" | "email">;
};

// 3. findUsersforChatSideBar method parameter and return type / interface
export interface BookingUsersForChatQuery {
  userId: UserDTO["_id"];
  role: Role; // need to send the opposite role
}
export type BookingUsersForChatView = Array<Pick<UserDTO, "_id" | "username" | "profileImage">>;

// 4. findStatsDataForProviderDashboard method parameter and return type / interface
export interface BookingStatsForProviderQuery {
  providerId: UserDTO["_id"];
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

// 5. findGraphDataForProviderDashboard method parameter and return type / interface
export interface BookingGraphStatsForProviderQuery {
  subscriptionGuard?: number;
  providerId?: UserDTO["_id"];
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

// 6. findStatsDataForAdminDashboard method parameter and return type / interface
export interface BookingsStatsDataAdminQuery extends CommonDateInput { }
export interface BookingsStatsDataAdminView extends Record<string, StatMetric | undefined> {
  totalAppointments: StatMetric;
  completedAppointments: StatMetric;
  cancelledAppointments: StatMetric;
  missedAppointments: StatMetric;
  rejectedAppointments: StatMetric;
};










//// **** booking usecase dtos **** ////

// user appointment booking via stripe creating session id usecase input
export interface UserAppointmentBookingViaStripeInput {
  userId: UserDTO["_id"];
  providerId: UserDTO["_id"];
  slotId: TimeSlotForClientOutput["_id"];
  selectedServiceMode: ServiceMode;
  date: Date
}


// user canncel booking usecase input and output
export interface UserCancelBookingInput {
  userId: UserDTO["_id"];
  bookingId: BookingDTO["_id"];
  reason?: string;
}
export type UserCancelBookingOutput = Pick<BookingDTO, "_id" | "appointmentStatus">;


// provider change booking appointment status usecase input and output
export interface ProviderChangeBookingAppointmentStatusInput {
  bookingId: BookingDTO["_id"];
  providerId: UserDTO["_id"];
  appointmentStatus: AppointmentStatus;
};
export type ProviderChangeBookingAppointmentStatusOutput = Pick<BookingDTO, "_id" | "appointmentStatus">;


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
export type UpdateBookingOnlineTrackOutput = Pick<Availability, "duration"> & Pick<BookingDTO, "videoCallRoomId">;

// validate join room usecase input and output
export interface ValidateJoinRoomInput {
  role: Role;
  bookingId: BookingDTO["_id"];
  roomId: BookingDTO["videoCallRoomId"];
  userId: UserDTO["_id"];
};