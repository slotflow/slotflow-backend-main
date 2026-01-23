import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { ISubscriptionMapping } from "../../../domain/interfaces/helper/ISubscriptionMapping.helper";
import { ProviderFetchDashboardGraphDataRequest, ProviderFetchDashboardGraphDataResponse } from "../../dtos/provider.dto";

export class ProviderFetchDashboardGraphDataUseCase {
    constructor(
        private bookingQueries: IBookingQueries,
        private subscriptionHelper: ISubscriptionMapping,
    ) { };

    async execute(payload: ProviderFetchDashboardGraphDataRequest): Promise<ProviderFetchDashboardGraphDataResponse> {
        try {
            const { providerId, subscription, endDate, startDate } = payload;

            const subscriptionGuard = await this.subscriptionHelper.getLevel(subscription);
            if (subscriptionGuard === null) throw new Error("Invalid request");

            const resultArray = await this.bookingQueries.findGraphDataForProviderDashboard({
                providerId,
                subscriptionGuard,
                endDate,
                startDate
            });

            const dashboardGraphData: ProviderFetchDashboardGraphDataResponse = {
                appointmentsOvertimeChartData: resultArray?.appointmentsOvertimeChartData ?? [],
                peakBookingHoursChartData: resultArray?.peakBookingHoursChartData ?? [],
                appointmentModeChartData: resultArray?.appointmentModeChartData ?? [],
                completionBreakdownChartData: resultArray?.completionBreakdownChartData ?? [],
                newVsReturningUsersChartData: resultArray?.newVsReturningUsersChartData ?? [],
                topBookingDaysChartData: resultArray?.topBookingDaysChartData ?? [],
            }

            return dashboardGraphData;
        } catch (error) {
            log.error("ProviderFetchDashboardGraphDataUseCase failed", error as Error);
            throw error;
        };
    };
};