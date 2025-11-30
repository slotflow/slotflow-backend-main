import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";
import { AdminFetchDashboardAppointmentStatsDataResponse, AdminFetchDashboardProviderStatsDataResponse, AdminFetchDashboardRevenueStatsDataResponse, AdminFetchDashboardSubscriptionStatsDataResponse, AdminFetchDashboardTodayStatsDataResponse, AdminFetchDashboardUserStatsDataResponse } from "../../infrastructure/dtos/admin.dto";

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
            console.log("AdminFetchDashboardTodaysDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard todays data");
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
            console.log("AdminFetchDashboardUserStatsDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard user stats");
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
            console.log("AdminFetchDashboardProviderStatsDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard provider stats");
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
        } catch (error) {
            console.log("AdminFetchDashboardSubscriptionStatsDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard subscription stats");
        }
    }
}


export class AdminFetchDashboardRevenueStatsDataUseCase {
    constructor(
        private paymentRepositoryImpl: PaymentRepositoryImpl
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardRevenueStatsDataResponse>> {
        try {
            const revenueData = await this.paymentRepositoryImpl.findPaymentStatsForAdminDashboard();
            return { success: true, message: "FetchedSuccessfully", data: revenueData }
        } catch (error) {
            console.log("AdminFetchDashboardRevenueStatsDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard revenue stats");
        }
    }
}

export class AdminFetchDashboardAppointmentsStatsDataUseCase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardAppointmentStatsDataResponse>> {
        try {
            const appointmentData = await this.bookingRepositoryImpl.findBookingStatsForAdminDashboard();
            return { success: true, message: "FetchedSuccessfully", data: appointmentData }
        } catch (error) {
            console.log("AdminFetchDashboardAppointmentsStatsDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard appointments stats");
        }
    }
}