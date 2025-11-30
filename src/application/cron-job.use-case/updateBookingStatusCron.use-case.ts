import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";

export class UpdateBookingStatusCronUseCase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl,
    ) { }

    async execute(): Promise<boolean> {
        try {
            const todaysExhaustedBookings = await this.bookingRepositoryImpl.findTodaysBookingForCronjob();
            return todaysExhaustedBookings;
        } catch (error) {
            console.log("UpdateBookingStatusCronUseCase error : ", error);
            throw new Error("Failed to update booking status");
        }
    }
}