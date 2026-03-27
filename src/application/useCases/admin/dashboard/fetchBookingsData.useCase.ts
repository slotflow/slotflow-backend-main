import { log } from "../../../../shared/logger/logger";
import { FetchBookingsDataRequest, FetchBookingsDataResponse } from "../../../dtos/admin.dto";
import { IBookingQueries } from "../../../queries/IBooking.queries";

export class FetchBookingsDataUseCase {
    constructor(
        private bookingQueries: IBookingQueries
    ) { };

    async execute(payload: FetchBookingsDataRequest): Promise<FetchBookingsDataResponse> {
        try {
            return await this.bookingQueries.findStatsDataForAdminDashboard(payload);
        } catch (error) {
            log.error("FetchBookingsDataUseCase failed", error as Error);
            throw error;
        };
    };
};