import { BookingModel } from "../models/booking.model";
import { BookingMapper } from "../mappers/booking.mapper";
import { Booking } from "../../domain/entities/booking.entity";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { IBookingRepository } from "../../domain/interfaces/repositories/IBooking.repository";

export class BookingRepositoryImpl implements IBookingRepository {

    async create(booking: Booking): Promise<Booking> {
        const persistence = BookingMapper.toPersistence(booking);
        const doc = await BookingModel.create(persistence);
        return BookingMapper.toDomain(doc);
    };

    async findById(bookingId: string): Promise<Booking | null> {
        const doc = await BookingModel.findById(bookingId);
        return doc ? BookingMapper.toDomain(doc) : null;
    };

    async findByUserId(userId: string, date: Date, time: string): Promise<Array<Booking> | null> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const docs = await BookingModel.find(
            {
                userId,
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay,
                },
                appointmentTime: time,
                appointmentStatus: {
                    $in: [AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED],
                },
            }
        );

        return docs ? docs.map(doc => BookingMapper.toDomain(doc)) : null;
    };

    async findOneByUserId(userId: string): Promise<Booking | null> {
        const doc = await BookingModel.findOne({ userId }).sort({ createdAt: -1 });
        return doc ? BookingMapper.toDomain(doc) : null;
    }

    async findByRoomId(roomId: string): Promise<Booking | null> {
        const doc = await BookingModel.findOne({ videoCallRoomId:roomId });
        return doc ? BookingMapper.toDomain(doc) : null;
    };

    async update(booking: Booking): Promise<Booking> {
        const persistence = BookingMapper.toPersistence(booking);

        const doc = await BookingModel.findByIdAndUpdate(
            booking._id,
            { $set: persistence },
            { new: true }
        );

        if (!doc) {
            throw new Error("Booking not found");
        }

        return BookingMapper.toDomain(doc);
    };

};