import { log } from "../../../../shared/logger/logger";
import { IBookingQueries } from "../../../queries/IBooking.queries";
import { ProviderFetchDashboardBookingStatsDataRequest, ProviderFetchDashboardBookingStatsDataResponse } from "../../../dtos/provider.dto";

export class FetchStatsUseCase {
    constructor(
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(payload: ProviderFetchDashboardBookingStatsDataRequest): Promise<ProviderFetchDashboardBookingStatsDataResponse> {
        try {

            const [
                bookingStatsArray,
            ] = await Promise.all([
                this.bookingQueries.findStatsDataForProviderDashboard(payload),
            ]);

            return { ...bookingStatsArray };
        } catch (error) {
            log.error("ProviderFetchDashboardStatsUseCase failed", error as Error);
            throw error;
        };
    };
};