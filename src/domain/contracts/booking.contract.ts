import { ParticipantPresence, statusTrack } from "../commands/booking.commands";
import { AppointmentStatus } from "../enums/appointmentStatus.enum";

export interface OnlineTrack {
    user: ParticipantPresence;
    provider: ParticipantPresence;
};

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
    onlineTrack: OnlineTrack | null,
    statusTrack: statusTrack[],
    createdAt: Date,
    updatedAt: Date,
}