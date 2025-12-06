import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class UpdateBookingStatusCronUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
    ) { }

    async execute(): Promise<boolean> {
        try {
            const todaysExhaustedBookings = await this.bookingRepository.findTodaysBookingForCronjob();
            return todaysExhaustedBookings;
        } catch (error) {
            console.log("UpdateBookingStatusCronUseCase error : ", error);
            throw new Error("Failed to update booking status");
        }
    }
}