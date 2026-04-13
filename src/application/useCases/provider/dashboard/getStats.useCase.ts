import { log } from "../../../../shared/logger/logger";
import { IBookingQueries } from "../../../queries/IBooking.queries";
import { ProviderGetDashboardBookingStatsDataRequest, ProviderGetDashboardBookingStatsDataResponse } from "../../../dtos/provider.dto";

export class GetStatsUseCase {
    constructor(
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(payload: ProviderGetDashboardBookingStatsDataRequest): Promise<ProviderGetDashboardBookingStatsDataResponse> {
        try {

            const [
                bookingStatsArray,
            ] = await Promise.all([
                this.bookingQueries.findStatsDataForProviderDashboard(payload),
            ]);

            return { ...bookingStatsArray };
        } catch (error) {
            log.error("ProviderGetDashboardStatsUseCase failed", error as Error);
            throw error;
        };
    };
};