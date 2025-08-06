import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { AdminFetchDashboardTodayStatsDataResponse, AdminFetchDashboardUserStatsDataResponse } from "../../infrastructure/dtos/admin.dto";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";

export class AdminFetchDashboardTodaysDataUseCase {
    constructor(
        private userRepositoryImppl: UserRepositoryImpl,
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private paymentRepositoryImpl: PaymentRepositoryImpl,
        private bookingRepositoryImpl: BookingRepositoryImpl,
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardTodayStatsDataResponse>> {
        try {
            const [
                usersData,
                providersData,
                paymentData,
                appointmentData
            ] = await Promise.all([
                this.userRepositoryImppl.findUsersCount({ today: true }),
                this.providerRepositoryImpl.findProvidersCount({ today: true }),
                this.paymentRepositoryImpl.findTodayPaymentStatsForAdminDashboard(),
                this.bookingRepositoryImpl.findTodayBookingStatsForAdminDashboard()
            ]);

            const responseData: AdminFetchDashboardTodayStatsDataResponse = {
                newUsers: usersData,
                newProviders: providersData,
                todaysTotalRevenue: paymentData.todaysTotalRevenue,
                todaysTotalPayouts: paymentData.todaysTotalPayouts,
                todaysAppointments: appointmentData.todaysAppointments,
                todaysCancelledAppointments: appointmentData.todaysCancelledAppointments,
                todaysCompletedAppointments: appointmentData.todaysCompletedAppointments
            };

            return { success: true, message: "Fetched successfully", data: responseData }
        } catch (error) {
            console.log("Admin dahsboard todays data fetching error");
            throw new Error("Admin dashboard todays data fetching error");
        }
    }
}


export class AdminFetchDashboardUserStatsDataUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardUserStatsDataResponse>> {
        try {

            const dashboardUserStatsData = await this.userRepositoryImpl.findUsersStatsData();
            return { success: true, message: "Fetched successfully", data: dashboardUserStatsData };

        } catch (error) {
            console.log("Admin dashboard user stats fetching usecase error : ", error);
            throw new Error("Admin dashboard user stats fetching error");
        }
    }
}