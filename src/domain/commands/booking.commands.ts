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

export type CreateBookingProps = Omit<BookingProps, "_id" | "createdAt" | "updatedAt">;

export type UpdateBookingProps = Partial<Omit<BookingProps, "_id" | "serviceProviderId" | "userId" | "createdAt" | "updatedAt">>;
