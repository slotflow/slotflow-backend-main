import { log } from "../../../../shared/logger/logger";
import { FetchBookingsDataResponse } from "../../../dtos/admin.dto";
import { IBookingQueries } from "../../../queries/IBooking.queries";

export class FetchBookingsDataUseCase {
    constructor(
        private bookingQueries: IBookingQueries
    ) { };

    async execute(): Promise<FetchBookingsDataResponse> {
        try {
            return await this.bookingQueries.findStatsDataForAdminDashboard();
        } catch (error) {
            log.error("FetchBookingsDataUseCase failed", error as Error);
            throw error;
        };
    };
};