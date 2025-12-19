import { Types } from "mongoose";
import { BookingModel } from "./booking.model";
import { BookingMapper } from "../../mappers/booking.mapper";
import { Booking } from "../../../domain/entities/booking.entity";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class BookingRepositoryImpl implements IBookingRepository {

    async create(booking: Booking, options?: { session: any; }): Promise<Booking> {
        const persistence = BookingMapper.toPersistence(booking);
        const created = await BookingModel.create(persistence);
        return BookingMapper.toDomain(created);
    }

    async findById(bookingId: string): Promise<Booking | null> {
        const doc = await BookingModel.findById(
            new Types.ObjectId(bookingId)
        );

        return doc ? BookingMapper.toDomain(doc) : null;
    }

    async findByUserId(userId: string, day: string, date: Date, time: string): Promise<Array<Booking> | null> {
        const docs = await BookingModel.find(
            {
                userId: new Types.ObjectId(userId),
                ppointmentDay: day,
                createdAt: date,
                appointmentTime: time,
                appointmentStatus: AppointmentStatus.Booked,
            }
        );

        return docs ? docs.map(doc => BookingMapper.toDomain(doc)) : null;
    }

    async findByroomId(roomId: string): Promise<Booking | null> {
        const doc = await BookingModel.findById(
            {
                roomId: new Types.ObjectId(roomId)
            }
        );
        return doc ? BookingMapper.toDomain(doc) : null;
    }

    async update(booking: Booking, options?: { session: any; }): Promise<Booking> {
        const persistence = BookingMapper.toPersistence(booking);

        const updated = await BookingModel.findByIdAndUpdate(
            new Types.ObjectId(booking._id),
            persistence,
            { new: true }
        );

        if (!updated) {
            throw new Error("Booking not found");
        }

        return BookingMapper.toDomain(updated);
    }
}