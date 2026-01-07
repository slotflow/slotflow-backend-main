import { log } from "../../../shared/logger/logger";
import { IUserQueries } from "../../queries/IUser.queries";
import { IPaymentQueries } from "../../queries/IPayment.queries";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { IProviderQueries } from "../../queries/IProvider.queries";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { AdminFetchDashboardAppointmentStatsDataResponse, AdminFetchDashboardProviderStatsDataResponse, AdminFetchDashboardRevenueStatsDataResponse, AdminFetchDashboardSubscriptionStatsDataResponse, AdminFetchDashboardTodayStatsDataResponse, AdminFetchDashboardUserStatsDataResponse } from "../../dtos/admin.dto";

export class AdminFetchDashboardTodaysDataUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerRepository: IProviderRepository,
        private paymentQueries: IPaymentQueries,
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(): Promise<AdminFetchDashboardTodayStatsDataResponse> {
        try {
            const [
                usersData,
                providersData,
                paymentData,
                appointmentData
            ] = await Promise.all([
                this.userRepository.count(true),
                this.providerRepository.count(true),
                this.paymentQueries.findTodayStatsDataForAdminDashboard(),
                this.bookingQueries.findTodayStatsDataForAdminDashboard()
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

            return responseData;
        } catch (error) {
            log.error("AdminFetchDashboardTodaysDataUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminFetchDashboardUserStatsDataUseCase {
    constructor(
        private useQueries: IUserQueries
    ) { };

    async execute(): Promise<AdminFetchDashboardUserStatsDataResponse> {
        try {
            return await this.useQueries.fetchStats();
        } catch (error) {
            log.error("AdminFetchDashboardUserStatsDataUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminFetchDashboardProviderStatsDataUseCase {
    constructor(
        private providerQuery: IProviderQueries
    ) { };

    async execute(): Promise<AdminFetchDashboardProviderStatsDataResponse> {
        try {
            return await this.providerQuery.fetchStats();
        } catch (error) {
            log.error("AdminFetchDashboardProviderStatsDataUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminFetchDashboardSubscriptionStatsDataUseCase {
    constructor(
        private subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(): Promise<AdminFetchDashboardSubscriptionStatsDataResponse> {
        try {
            return await this.subscriptionQueries.findStatsForAdminDashboard();
        } catch (error) {
            log.error("AdminFetchDashboardSubscriptionStatsDataUseCase failed", error as Error);
            throw error;
        };
    };
};


export class AdminFetchDashboardRevenueStatsDataUseCase {
    constructor(
        private paymentQueries: IPaymentQueries
    ) { };

    async execute(): Promise<AdminFetchDashboardRevenueStatsDataResponse> {
        try {
            return await this.paymentQueries.findStatsDataForAdminDashboard();
        } catch (error) {
            log.error("AdminFetchDashboardRevenueStatsDataUseCase failed", error as Error);
            throw error;
        };
    };
};

export class AdminFetchDashboardAppointmentsStatsDataUseCase {
    constructor(
        private bookingQueries: IBookingQueries
    ) { };

    async execute(): Promise<AdminFetchDashboardAppointmentStatsDataResponse> {
        try {
            return await this.bookingQueries.findStatsDataForAdminDashboard();
        } catch (error) {
            log.error("AdminFetchDashboardAppointmentsStatsDataUseCase failed", error as Error);
            throw error;
        };
    };
};