import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { SubscriptionHelper } from "../../infrastructure/helpers/subscriptionMapping";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderFetchDashboardGraphDataRequest, ProviderFetchDashboardGraphDataResponse } from "../../infrastructure/dtos/provider.dto";

export class ProviderFetchDashboardGraphDataUseCase {
    constructor(
        private bookingRepository: BookingRepositoryImpl,
        private subscriptionHelper: SubscriptionHelper
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