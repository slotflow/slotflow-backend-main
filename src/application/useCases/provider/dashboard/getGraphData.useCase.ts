import { IBookingQueries } from "../../../queries/IBooking.queries";
import { BadRequestError } from "../../../../shared/error/appError";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { GetProviderGraphDataInput, GetProviderGraphDataOutput } from "../../../dtos/provider.dto";
import { ISubscriptionMapping } from "../../../../domain/interfaces/helper/ISubscriptionMapping.helper";


export class GetProviderGraphDataUseCase {
    constructor(
        private bookingQueries: IBookingQueries,
        private subscriptionHelper: ISubscriptionMapping,
    ) { };

    async execute(input: GetProviderGraphDataInput): Promise<GetProviderGraphDataOutput> {
        try {
            const { providerId, subscription, endDate, startDate, isAdmin } = input;
            if (!providerId || !subscription) {
                throw new BadRequestError();
            }

            const subscriptionGuard = await this.subscriptionHelper.getLevel(subscription);
            if (subscriptionGuard === null) {
                throw new BadRequestError();
            }

            const resultArray = await this.bookingQueries.findGraphDataForDashboard({
                providerId,
                subscriptionGuard,
                endDate,
                startDate,
                isAdmin
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
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get graph data");
        };
    };
};