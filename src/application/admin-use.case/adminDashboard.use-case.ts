import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";
import { AdminFetchDashboardProviderStatsDataResponse, AdminFetchDashboardRevenueStatsDataResponse, AdminFetchDashboardSubscriptionStatsDataResponse, AdminFetchDashboardTodayStatsDataResponse, AdminFetchDashboardUserStatsDataResponse } from "../../infrastructure/dtos/admin.dto";

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
            console.log("Admin dahsboard todays data fetching error : ",error);
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
            const userData = await this.userRepositoryImpl.findUsersStatsData();
            return { success: true, message: "Fetched successfully", data: userData };
        } catch (error) {
            console.log("Admin dashboard user stats fetching usecase error : ", error);
            throw new Error("Admin dashboard user stats fetching error");
        }
    }
}


export class AdminFetchDashboardProviderStatsDataUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardProviderStatsDataResponse>> {
        try {
            const providerData = await this.providerRepositoryImpl.findProvidersStatsForAdminDashboard();
            return { success: true, message: "Fetched successfully", data: providerData };
        } catch (error) {
            console.log("Admin dashboard provider stats fetching usecase error : ", error);
            throw new Error("Admin dashboard provider stats fetching error");
        }
    }
}


export class AdminFetchDashboardSubscriptionStatsDataUseCase {
    constructor(
        private subscriptionRepositoryImpl: SubscriptionRepositoryImpl
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardSubscriptionStatsDataResponse>> {
        try {
            const subscriptionData = await this.subscriptionRepositoryImpl.findSubscriptionStatsForAdminDashboard();
            return { success: true, message: "Fetched successfully", data: subscriptionData }
        } catch(error) {
            console.log("Admin dashboard subscription stats fetching usecase error : ", error);
            throw new Error("Admin dashboard subscription stats fetching error");
        }
    }
}


export class AdminFetchDashboardRevenueStatsDataUseCase {
    constructor(
        private paymentRepositoryImpl: PaymentRepositoryImpl
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardRevenueStatsDataResponse>> {
        try {
            const revenueData = await this.paymentRepositoryImpl.fetchPaymentStatsForAdminDashboard();
            return { success: true, message: "FetchedSuccessfully", data: revenueData }
        } catch (error) {
            console.log("Admin dashboard revenue stats fetching usecase error : ", error);
            throw new Error("Admin dashboard revenue stats fetching error");
        }
    }
}