import { ApiResponse } from "../../dtos/common.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { AdminFetchDashboardAppointmentStatsDataResponse, AdminFetchDashboardProviderStatsDataResponse, AdminFetchDashboardRevenueStatsDataResponse, AdminFetchDashboardSubscriptionStatsDataResponse, AdminFetchDashboardTodayStatsDataResponse, AdminFetchDashboardUserStatsDataResponse } from "../../dtos/admin.dto";
import { IAdminProviderQuery } from "../../queries/IProvider.queries";
import { IAdminUserQuery } from "../../queries/admin/IAdminUserQuery";

export class AdminFetchDashboardTodaysDataUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerRepository: IProviderRepository,
        private paymentRepository: IPaymentRepository,
        private bookingRepository: IBookingRepository,
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardTodayStatsDataResponse>> {
        try {
            const [
                usersData,
                providersData,
                paymentData,
                appointmentData
            ] = await Promise.all([
                this.userRepository.count(true),
                this.providerRepository.count(true),
                this.paymentRepository.findTodayPaymentStatsForAdminDashboard(),
                this.bookingRepository.findTodayBookingStatsForAdminDashboard()
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
        private adminUserQuery: IAdminUserQuery
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardUserStatsDataResponse>> {
        try {
            const userData = await this.adminUserQuery.fetchStats();
            return { success: true, message: "Fetched successfully", data: userData };
        } catch (error) {
            console.log("AdminFetchDashboardUserStatsDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard user stats");
        }
    }
}


export class AdminFetchDashboardProviderStatsDataUseCase {
    constructor(
        private adminProviderQuery: IAdminProviderQuery
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardProviderStatsDataResponse>> {
        try {
            const providerData = await this.adminProviderQuery.fetchStats();
            return { success: true, message: "Fetched successfully", data: providerData };
        } catch (error) {
            console.log("AdminFetchDashboardProviderStatsDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard provider stats");
        }
    }
}


export class AdminFetchDashboardSubscriptionStatsDataUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardSubscriptionStatsDataResponse>> {
        try {
            const subscriptionData = await this.subscriptionRepository.findSubscriptionStatsForAdminDashboard();
            return { success: true, message: "Fetched successfully", data: subscriptionData }
        } catch (error) {
            console.log("AdminFetchDashboardSubscriptionStatsDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard subscription stats");
        }
    }
}


export class AdminFetchDashboardRevenueStatsDataUseCase {
    constructor(
        private paymentRepository: IPaymentRepository
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardRevenueStatsDataResponse>> {
        try {
            const revenueData = await this.paymentRepository.findPaymentStatsForAdminDashboard();
            return { success: true, message: "FetchedSuccessfully", data: revenueData }
        } catch (error) {
            console.log("AdminFetchDashboardRevenueStatsDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard revenue stats");
        }
    }
}

export class AdminFetchDashboardAppointmentsStatsDataUseCase {
    constructor(
        private bookingRepository: IBookingRepository
    ) { }

    async execute(): Promise<ApiResponse<AdminFetchDashboardAppointmentStatsDataResponse>> {
        try {
            const appointmentData = await this.bookingRepository.findBookingStatsForAdminDashboard();
            return { success: true, message: "FetchedSuccessfully", data: appointmentData }
        } catch (error) {
            console.log("AdminFetchDashboardAppointmentsStatsDataUseCase error : ", error);
            throw new Error("Failed to fetch dashboard appointments stats");
        }
    }
}