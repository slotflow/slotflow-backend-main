import { log } from "../../../../shared/logger/logger";
import { GetBookingsDataInput, GetBookingsDataOutput } from "../../../dtos/admin.dto";
import { IBookingQueries } from "../../../queries/IBooking.queries";

export class GetBookingsDataUseCase {
    constructor(
        private bookingQueries: IBookingQueries
    ) { };

    async execute(input: GetBookingsDataInput): Promise<GetBookingsDataOutput> {
        try {
            return await this.bookingQueries.findStatsDataForAdminDashboard(input);
        } catch (error) {
            log.error("GetBookingsDataUseCase failed", error as Error);
            throw error;
        };
    };
};