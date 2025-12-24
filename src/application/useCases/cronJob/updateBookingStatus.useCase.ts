import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";

export class UpdateBookingStatusCronUseCase {
    constructor(
        private bookingQueries: IBookingQueries
    ) { };

    async execute(): Promise<boolean> {
        try {
            const todaysExhaustedBookings = await this.bookingQueries.findTodaysBookingForCronjob();
            return todaysExhaustedBookings;
        } catch (error) {
            log.error("UpdateBookingStatusCronUseCase failed", error as Error);
            throw error;
        };
    };
};