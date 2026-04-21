import { IBookingQueries } from "../../../queries/IBooking.queries";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { GetBookingsDataInput, GetBookingsDataOutput } from "../../../dtos/admin.dto";

export class GetBookingsDataUseCase {
    constructor(
        private bookingQueries: IBookingQueries
    ) { };

    async execute(input: GetBookingsDataInput): Promise<GetBookingsDataOutput> {
        try {
            return await this.bookingQueries.findStatsDataForAdminDashboard(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to fetch bookings data");
        };
    };
};