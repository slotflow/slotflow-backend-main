import { log } from "../../../../shared/logger/logger";
import { GetBookingsDataRequest, GetBookingsDataResponse } from "../../../dtos/admin.dto";
import { IBookingQueries } from "../../../queries/IBooking.queries";

export class GetBookingsDataUseCase {
    constructor(
        private bookingQueries: IBookingQueries
    ) { };

    async execute(payload: GetBookingsDataRequest): Promise<GetBookingsDataResponse> {
        try {
            return await this.bookingQueries.findStatsDataForAdminDashboard(payload);
        } catch (error) {
            log.error("GetBookingsDataUseCase failed", error as Error);
            throw error;
        };
    };
};