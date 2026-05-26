import { CalendarStatus, Role } from "../enums/common.enum";
import { BookingProps } from "../contracts/booking.contract";
import { AppointmentStatus } from "../enums/appointmentStatus.enum";

export interface ParticipantPresence {
    joined: boolean;
    joinedTime: Date | null;
    leftCallTime: Date | null;
}

export interface statusTrack {
    appointmentStatus: AppointmentStatus;
    time: Date;
}

export interface OnlineTrack {
    user: ParticipantPresence;
    provider: ParticipantPresence;
};

export interface CalendarData {
    user: {
        googleEventId: string | null;
        calendarStatus: CalendarStatus; 
    } | null,
    provider: {
        googleEventId: string | null;
        calendarStatus: CalendarStatus; 
    } | null,
};

export type CreateBookingProps = Omit<BookingProps, "_id" | "createdAt" | "updatedAt" | "onlineTrack" | "calendarData" | "paymentId" | "googleEventId">;

export type UpdateEventIProps = Pick<BookingProps, "googleEventId">;

export type UpdateAppointmentProps = Pick<BookingProps, "appointmentStatus">;

export type UpdateBookingAfterPaymentProps = Pick<BookingProps, "paymentId" | "appointmentStatus">;

export interface CreateCalendarProps {
    role: Role;
    eventId: string;
};

export interface FailedCalendarProps {
    role: Role;
};