import { AppointmentStatus } from "../enums/appointmentStatus.enum";
import { CalendarData, OnlineTrack, statusTrack } from "../commands/booking.commands";

export interface BookingProps {
    _id: string,
    serviceProviderId: string,
    userId: string,
    appointmentDate: Date,
    appointmentTime: string,
    appointmentMode: string,
    appointmentStatus: AppointmentStatus,
    slotId: string,
    paymentId: string | null,
    videoCallRoomId: string | null,
    googleEventId: string | null,
    calendarData: CalendarData | null,
    onlineTrack: OnlineTrack | null,
    statusTrack: statusTrack[],
    createdAt: Date,
    updatedAt: Date,
}