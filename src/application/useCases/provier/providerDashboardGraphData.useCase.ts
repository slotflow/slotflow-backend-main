import { ApiResponse } from "../../dtos/common.dto";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { ISubscriptionMapping } from "../../../domain/interfaces/helper/ISubscriptionMapping.helper";
import { ProviderFetchDashboardGraphDataRequest, ProviderFetchDashboardGraphDataResponse } from "../../dtos/provider.dto";

export class ProviderFetchDashboardGraphDataUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private subscriptionHelper: ISubscriptionMapping
    ) { }

    async execute(payload: ProviderFetchDashboardGraphDataRequest): Promise<ApiResponse<ProviderFetchDashboardGraphDataResponse>> {
        try {
            const { providerId, subscription, endDate, startDate } = payload;

            const subscriptionGuard = await this.subscriptionHelper.getLevel(subscription);
            if (subscriptionGuard === null) throw new Error("Invalid request");

            const resultArray = await this.bookingRepository.findBookingGraphDataForProviderDashboard({
                providerId,
                subscriptionGuard,
                endDate,
                startDate
            });
            if (!resultArray) throw new Error("No graph data found");

            const dashboardGraphData: ProviderFetchDashboardGraphDataResponse = {
                appointmentsOvertimeChartData: resultArray.appointmentsOvertimeChartData ?? [],
                peakBookingHoursChartData: resultArray.peakBookingHoursChartData ?? [],
                appointmentModeChartData: resultArray.appointmentModeChartData ?? [],
                completionBreakdownChartData: resultArray.completionBreakdownChartData ?? [],
                newVsReturningUsersChartData: resultArray.newVsReturningUsersChartData ?? [],
                topBookingDaysChartData: resultArray.topBookingDaysChartData ?? [],
            }

            return { success: true, message: "Dashboard graph data fetched successfully", data: dashboardGraphData }
        } catch (error) {
            console.log("ProviderFetchDashboardGraphDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard graph data");
        }
    }
}