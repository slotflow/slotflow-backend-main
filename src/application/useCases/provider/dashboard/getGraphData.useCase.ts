import { log } from "../../../../shared/logger/logger";
import { IBookingQueries } from "../../../queries/IBooking.queries";
import { GetProviderGraphDataInput, GetProviderGraphDataOutput } from "../../../dtos/provider.dto";
import { ISubscriptionMapping } from "../../../../domain/interfaces/helper/ISubscriptionMapping.helper";


export class GetProviderGraphDataUseCase {
    constructor(
        private bookingQueries: IBookingQueries,
        private subscriptionHelper: ISubscriptionMapping,
    ) { };

    async execute(input: GetProviderGraphDataInput): Promise<GetProviderGraphDataOutput> {
        try {
            const { providerId, subscription, endDate, startDate } = input;

            const subscriptionGuard = await this.subscriptionHelper.getLevel(subscription);
            if (subscriptionGuard === null) throw new Error("Invalid request");

            const resultArray = await this.bookingQueries.findGraphDataForProviderDashboard({
                providerId,
                subscriptionGuard,
                endDate,
                startDate
            });

            const dashboardGraphData: GetProviderGraphDataOutput = {
                appointmentsOvertimeChartData: resultArray?.appointmentsOvertimeChartData ?? [],
                peakBookingHoursChartData: resultArray?.peakBookingHoursChartData ?? [],
                appointmentModeChartData: resultArray?.appointmentModeChartData ?? [],
                completionBreakdownChartData: resultArray?.completionBreakdownChartData ?? [],
                newVsReturningUsersChartData: resultArray?.newVsReturningUsersChartData ?? [],
                topBookingDaysChartData: resultArray?.topBookingDaysChartData ?? [],
            }

            return dashboardGraphData;
        } catch (error) {
            log.error("GetProviderGraphDataUseCase failed", error as Error);
            throw error;
        };
    };
};