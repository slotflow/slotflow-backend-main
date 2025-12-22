import { Booking } from "../../entities/booking.entity";

export interface IBookingRepository {
    
    create(booking: Booking) : Promise<Booking>;

    findByUserId(userId: string, day: string, date: Date, time: string): Promise<Array<Booking> | null>;

    findById(bookingId: string): Promise<Booking | null>;

    findByroomId(roomId: string): Promise<Booking | null>;

    update(booking: Booking) : Promise<Booking>;
    
}