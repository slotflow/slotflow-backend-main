import { Provider } from "../../domain/entities/provider.entity";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { Validator } from "../../infrastructure/validator/validator";
import { ProviderFetchDashboardGraphDataResponse } from "../../infrastructure/dtos/provider.dto";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";

export class ProviderFetchDashboardGraphDataUseCase {
    constructor(
        private bookingRepository: BookingRepositoryImpl,
    ) { }

    async execute(providerId: Provider["_id"]): Promise<ApiResponse<ProviderFetchDashboardGraphDataResponse>> {
        try {

            if (!providerId) throw new Error("Invalid request");
            Validator.validateObjectId(providerId, "providerId");

            const resultArray = await this.bookingRepository.findBookingGraphDataForDashboard(providerId);
            const dashboardGraphData: ProviderFetchDashboardGraphDataResponse = { 
                appointmentsOvertimeChartData: resultArray.appointmentsOvertimeChartData,
                peakBookingHoursChartData: resultArray.peakBookingHoursChartData,
                appointmentModeChartData: resultArray.appointmentModeChartData,
                completionBreakdownChartData: resultArray.completionBreakdownChartData,
                newVsReturningUsersChartData: resultArray.newVsReturningUsersChartData,
                topBookingDaysChartData: resultArray.topBookingDaysChartData,
            }

            console.log("dashboardGraphData : ",dashboardGraphData);

            return { success: true, message: "Dashboard graph data fetched successfully", data: dashboardGraphData }
        } catch (error) {
            return { success: false, message: "Dashboard graph data fetching failed" }
        }
    }
}