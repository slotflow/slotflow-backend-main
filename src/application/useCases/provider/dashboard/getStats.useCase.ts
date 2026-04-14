import { log } from "../../../../shared/logger/logger";
import { IBookingQueries } from "../../../queries/IBooking.queries";
import { GetProviderStatsInput, GetProviderStatsOutput } from "../../../dtos/provider.dto";

export class GetProviderStatsUseCase {
    constructor(
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(input: GetProviderStatsInput): Promise<GetProviderStatsOutput> {
        try {
            const [
                bookingStatsArray,
            ] = await Promise.all([
                this.bookingQueries.findStatsDataForProviderDashboard(input),
            ]);

            return { ...bookingStatsArray };
        } catch (error) {
            log.error("ProviderGetDashboardStatsUseCase failed", error as Error);
            throw error;
        };
    };
};