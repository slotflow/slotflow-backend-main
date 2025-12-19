import { Types } from "mongoose";
import { IBooking } from "../database/booking/booking.model";
import { Booking } from "../../domain/entities/booking.entity";

export class BookingMapper {

    static toDomain(doc: IBooking): Booking {
        return new Booking({
            _id: doc._id.toString(),
            serviceProviderId: doc.serviceProviderId.toString(),
            userId: doc.userId.toString(),
            appointmentDate: doc.appointmentDate,
            appointmentTime: doc.appointmentTime,
            appointmentMode: doc.appointmentMode,
            appointmentStatus: doc.appointmentStatus,
            slotId: doc.slotId.toString(),
            paymentId: doc.paymentId?.toString() ?? null,
            videoCallRoomId: doc.videoCallRoomId ?? null,
            googleEventId: doc.googleEventId ?? null,
            onlineTrack: doc.onlineTrack,
            statusTrack: doc.statusTrack,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static toPersistence(entity: Booking) {
        const props = entity.getProps();

        return {
            serviceProviderId: new Types.ObjectId(props.serviceProviderId),
            userId: new Types.ObjectId(props.userId),
            appointmentDate: props.appointmentDate,
            appointmentTime: props.appointmentTime,
            appointmentMode: props.appointmentMode,
            appointmentStatus: props.appointmentStatus,
            slotId: new Types.ObjectId(props.slotId),
            paymentId: props.paymentId,
            videoCallRoomId: props.videoCallRoomId,
            googleEventId: props.googleEventId,
            onlineTrack: props.onlineTrack,
            statusTrack: props.statusTrack,
            updatedAt: props.updatedAt,
        };
    }
}
