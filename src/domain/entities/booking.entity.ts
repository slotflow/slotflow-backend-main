import { Types } from "mongoose";

export enum AppointmentStatus {
    Booked = "Booked",
    Completed = "Completed",
    Cancelled = "Cancelled",
    Rejected = "RejectedByProvider",
    NotAttended = "NotAttended",
    Confirmed = "Confirmed"
}
export interface ParticipantPresence {
    joined: boolean;
    joinedTime: Date | null;
    leftCallTime: Date | null;
}

export class Booking {
    constructor(
        public _id: Types.ObjectId,
        public serviceProviderId: Types.ObjectId,
        public userId: Types.ObjectId,
        public appointmentDate: Date,
        public appointmentTime: string,
        public appointmentMode: string,
        public appointmentStatus: AppointmentStatus,
        public slotId: Types.ObjectId,
        public paymentId: Types.ObjectId | null,
        public videoCallRoomId: string | null,
        public googleEventId: string,
        public track: {
            user: ParticipantPresence;
            provider: ParticipantPresence;
        },
        public createdAt: Date,
        public updatedAt: Date,
    ) { }
}