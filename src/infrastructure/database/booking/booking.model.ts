import mongoose, { Document, Schema, Types } from "mongoose";
import { appointmentStatusArray } from "../../../shared/utils/constants";
import { AppointmentStatusType } from "../../../application/dtos/common.dto";
import { ParticipantPresence, statusTrack } from "../../../domain/commands/booking.commands";

export interface IBooking extends Document {
    _id: Types.ObjectId,
    serviceProviderId: Types.ObjectId,
    userId: Types.ObjectId,
    appointmentDate: Date,
    appointmentTime: string,
    appointmentMode: string,
    appointmentStatus: AppointmentStatusType,
    slotId: Types.ObjectId,
    paymentId: Types.ObjectId | null,
    videoCallRoomId: string | null,
    googleEventId: string,
    onlineTrack: {
        user: ParticipantPresence;
        provider: ParticipantPresence;
    },
    statusTrack: statusTrack[],
    createdAt: Date,
    updatedAt: Date,
}

const ParticipantPresenceSchema = new Schema<ParticipantPresence>({
    joined: { type: Boolean, default: false },
    joinedTime: { type: Date, default: null },
    leftCallTime: { type: Date, default: null },
}, { _id: false });

const StatusTrackSchema = new Schema<statusTrack>({
    appointmentStatus: { 
        type: String, 
        enum: Object.values(appointmentStatusArray), 
        required: true 
    },
    time: { 
        type: Date, 
        required: true 
    }
},  { _id: false })

const BookingSchema = new Schema<IBooking>({
    serviceProviderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Provider", 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    appointmentDate: { 
        type: Date, 
        required: true 
    },
    appointmentTime: { 
        type: String, 
        required: true 
    },
    appointmentMode: { 
        type: String, 
        required: true 
    },
    appointmentStatus: { 
        type: String, 
        enum: Object.values(appointmentStatusArray), 
        required: true 
    },
    slotId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "ServiceAvailability.slots", 
        required: true 
    },
    paymentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Payment" 
    },
    videoCallRoomId: {
        type: String,
        default: null,
    },
    googleEventId: {
        type: String,
        default: null,
    },
    onlineTrack: {
        user: { type: ParticipantPresenceSchema, default: () => ({}) },
        provider: { type: ParticipantPresenceSchema, default: () => ({}) },
    },
    statusTrack: {
        type: [StatusTrackSchema], 
        default: [] ,
    }
}, {
    timestamps: true
});

BookingSchema.index({ appointmentDate: 1, slotId: 1, serviceProviderId: 1 })

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);