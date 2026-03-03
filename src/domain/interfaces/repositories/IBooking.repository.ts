import { Booking } from "../../entities/booking.entity";

export interface IBookingRepository {

    create(booking: Booking): Promise<Booking>;

    findByUserId(userId: string, date: Date, time: string): Promise<Array<Booking> | null>;

    findOneByUserId(userId: string): Promise<Booking | null>;

    findById(bookingId: string): Promise<Booking | null>;

    findByRoomId(roomId: string): Promise<Booking | null>;

    update(booking: Booking): Promise<Booking>;

}