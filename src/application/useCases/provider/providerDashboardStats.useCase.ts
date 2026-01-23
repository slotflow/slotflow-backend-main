import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { IPaymentQueries } from "../../queries/IPayment.queries";
import { ProviderFetchDashboardStatsDataRequest, ProviderFetchDashboardStatsDataResponse } from "../../dtos/provider.dto";

export class ProviderFetchDashboardStatsUseCase {
    constructor(
        private bookingQueries: IBookingQueries,
        private paymentQueries: IPaymentQueries
    ) { };

    async execute(payload: ProviderFetchDashboardStatsDataRequest): Promise<ProviderFetchDashboardStatsDataResponse> {
        try {
            const { providerId } = payload;

            const [
                bookingStatsArray,
                paymentStatsArray
            ] = await Promise.all([
                this.bookingQueries.findStatsDataForProviderDashboard(providerId),
                this.paymentQueries.findStatsDataForProviderDashboard(providerId)
            ]);

            return { ...bookingStatsArray, ...paymentStatsArray };
        } catch (error) {
            log.error("ProviderFetchDashboardStatsUseCase failed", error as Error);
            throw error;
        };
    };
};