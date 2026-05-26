import { IBookingQueries } from "../../queries/IBooking.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";

export class UpdateBookingStatusUseCase {
    constructor(
        private bookingQueries: IBookingQueries
    ) { };

    async execute(): Promise<boolean> {
        try {
            const todaysExhaustedBookings = await this.bookingQueries.findTodaysBookingsForCronjob();
            return todaysExhaustedBookings;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to update booking status")
        };
    };
};