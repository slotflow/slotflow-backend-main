import { IBookingQueries } from "../../../queries/IBooking.queries";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { GetGraphDataInput, GetGraphDataOutput } from "../../../dtos/admin.dto";

export class GetAdminGraphDataUseCase {
    constructor(
        private readonly bookingQueries: IBookingQueries
    ) { }

    async execute(input: GetGraphDataInput): Promise<GetGraphDataOutput> {
        try {
            const resultArray = await this.bookingQueries.findGraphDataForDashboard({
                ...input,
                isAdmin: true
            });

            const dashboardGraphData: GetGraphDataOutput = {
                appointmentsOvertimeChartData: resultArray?.appointmentsOvertimeChartData ?? [],
                peakBookingHoursChartData: resultArray?.peakBookingHoursChartData ?? [],
                appointmentModeChartData: resultArray?.appointmentModeChartData ?? [],
                completionBreakdownChartData: resultArray?.completionBreakdownChartData ?? [],
                newVsReturningUsersChartData: resultArray?.newVsReturningUsersChartData ?? [],
                topBookingDaysChartData: resultArray?.topBookingDaysChartData ?? [],
            }

            return dashboardGraphData;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to fetch graph data");
        }
    }
}