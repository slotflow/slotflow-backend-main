import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";

export class UpdateBookingStatusUseCase {
    constructor(
        private bookingQueries: IBookingQueries
    ) { };

    async execute(): Promise<boolean> {
        try {
            const todaysExhaustedBookings = await this.bookingQueries.findTodaysBookingsForCronjob();
            return todaysExhaustedBookings;
        } catch (error) {
            log.error("UpdateBookingStatusUseCase failed", error as Error);
            throw error;
        };
    };
};