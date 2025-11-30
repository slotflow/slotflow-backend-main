import { Types } from "mongoose";
import { AppointmentStatusType } from "../../infrastructure/dtos/common.dto";

export interface ParticipantPresence {
    joined: boolean;
    joinedTime: Date | null;
    leftCallTime: Date | null;
}

export interface statusTrack {
    appointmentStatus: AppointmentStatusType;
    time: Date;
}

export class Booking {
    constructor(
        public _id: Types.ObjectId,
        public serviceProviderId: Types.ObjectId,
        public userId: Types.ObjectId,
        public appointmentDate: Date,
        public appointmentTime: string,
        public appointmentMode: string,
        public appointmentStatus: AppointmentStatusType,
        public slotId: Types.ObjectId,
        public paymentId: Types.ObjectId | null,
        public videoCallRoomId: string | null,
        public googleEventId: string,
        public onlineTrack: {
            user: ParticipantPresence;
            provider: ParticipantPresence;
        },
        public statusTrack: statusTrack[],
        public createdAt: Date,
        public updatedAt: Date,
    ) { }
}