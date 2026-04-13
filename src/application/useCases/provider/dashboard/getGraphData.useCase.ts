import { log } from "../../../../shared/logger/logger";
import { IBookingQueries } from "../../../queries/IBooking.queries";
import { ISubscriptionMapping } from "../../../../domain/interfaces/helper/ISubscriptionMapping.helper";
import { GetGraphDataRequest, GetGraphDataResponse } from "../../../dtos/provider.dto";


export class GetGraphDataUseCase {
    constructor(
        private bookingQueries: IBookingQueries,
        private subscriptionHelper: ISubscriptionMapping,
    ) { };

    async execute(payload: GetGraphDataRequest): Promise<GetGraphDataResponse> {
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

            const dashboardGraphData: GetGraphDataResponse = {
                appointmentsOvertimeChartData: resultArray?.appointmentsOvertimeChartData ?? [],
                peakBookingHoursChartData: resultArray?.peakBookingHoursChartData ?? [],
                appointmentModeChartData: resultArray?.appointmentModeChartData ?? [],
                completionBreakdownChartData: resultArray?.completionBreakdownChartData ?? [],
                newVsReturningUsersChartData: resultArray?.newVsReturningUsersChartData ?? [],
                topBookingDaysChartData: resultArray?.topBookingDaysChartData ?? [],
            }

            return dashboardGraphData;
        } catch (error) {
            log.error("GetGraphDataUseCase failed", error as Error);
            throw error;
        };
    };
};