import { ClientSession } from "mongoose";
import { Booking } from "../../entities/booking.entity";

export interface IBookingRepository {

    create(booking: Booking, session?: ClientSession): Promise<Booking | null>;

    findByUserId(userId: string, date: Date, time: string): Promise<Array<Booking> | null>;

    getLatestBookingByUserId(userId: string): Promise<Booking | null>;

    getFirstBookingByUserId(userId: string): Promise<Booking | null>;

    findById(bookingId: string): Promise<Booking | null>;

    findByRoomId(roomId: string, session?: ClientSession): Promise<Booking | null>;

    update(booking: Booking, session?: ClientSession): Promise<Booking | null>;

}