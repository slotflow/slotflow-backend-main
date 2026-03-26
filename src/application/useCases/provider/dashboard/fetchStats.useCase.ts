import { log } from "../../../../shared/logger/logger";
import { IBookingQueries } from "../../../queries/IBooking.queries";
import { FetchStatsDataRequest, FetchStatsDataResponse } from "../../../dtos/provider.dto";

export class FetchStatsUseCase {
    constructor(
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(payload: FetchStatsDataRequest): Promise<FetchStatsDataResponse> {
        try {
            const { providerId } = payload;

            const [
                bookingStatsArray,
            ] = await Promise.all([
                this.bookingQueries.findStatsDataForProviderDashboard(providerId),
            ]);

            return { ...bookingStatsArray };
        } catch (error) {
            log.error("ProviderFetchDashboardStatsUseCase failed", error as Error);
            throw error;
        };
    };
};