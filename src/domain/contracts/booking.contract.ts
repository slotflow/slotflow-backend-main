import { ParticipantPresence, statusTrack } from "../commands/booking.commands";

export interface BookingProps {
    _id: string,
    serviceProviderId: string,
    userId: string,
    appointmentDate: Date,
    appointmentTime: string,
    appointmentMode: string,
    appointmentStatus: string,
    slotId: string,
    paymentId: string | null,
    videoCallRoomId: string | null,
    googleEventId: string | null,
    onlineTrack: {
        user: ParticipantPresence;
        provider: ParticipantPresence;
    },
    statusTrack: statusTrack[],
    createdAt: Date,
    updatedAt: Date,
}