import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";
import { AdminFetchDashboardAppointmentsStatsDataUseCase, AdminFetchDashboardProviderStatsDataUseCase, AdminFetchDashboardRevenueStatsDataUseCase, AdminFetchDashboardSubscriptionStatsDataUseCase, AdminFetchDashboardTodaysDataUseCase, AdminFetchDashboardUserStatsDataUseCase } from "../../application/admin-use.case/adminDashboard.use-case";

const userRepositoryImpl = new UserRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();
const paymentRepositoryImpl = new PaymentRepositoryImpl();
const bookingRepositoryImpl = new BookingRepositoryImpl();
const subscriptionRepositoryImpl = new SubscriptionRepositoryImpl();
const adminFetchDashboardUserStatsDataUseCase = new AdminFetchDashboardUserStatsDataUseCase(userRepositoryImpl);
const adminFetchDashboardTodaysDataUseCase = new AdminFetchDashboardTodaysDataUseCase(userRepositoryImpl, providerRepositoryImpl, paymentRepositoryImpl, bookingRepositoryImpl);
const adminFetchDashboardProviderStatsDataUseCase = new AdminFetchDashboardProviderStatsDataUseCase(providerRepositoryImpl);
const adminFetchDashboardSubscriptionStatsDataUseCase = new AdminFetchDashboardSubscriptionStatsDataUseCase(subscriptionRepositoryImpl);
const adminFetchDashboardRevenueStatsDataUseCase = new AdminFetchDashboardRevenueStatsDataUseCase(paymentRepositoryImpl);
const adminFetchDashboardAppointmentsStatsDataUseCase = new AdminFetchDashboardAppointmentsStatsDataUseCase(bookingRepositoryImpl)

export class AdminDashboardController {
    constructor(
        private adminFetchDashboardTodaysDataUseCase: AdminFetchDashboardTodaysDataUseCase,
        private adminFetchDashboardUserStatsDataUseCase: AdminFetchDashboardUserStatsDataUseCase,
        private adminFetchDashboardProviderStatsDataUseCase: AdminFetchDashboardProviderStatsDataUseCase,
        private adminFetchDashboardSubscriptionStatsDataUseCase: AdminFetchDashboardSubscriptionStatsDataUseCase,
        private adminFetchDashboardRevenueStatsDataUseCase: AdminFetchDashboardRevenueStatsDataUseCase,
        private adminFetchDashboardAppointmentsStatsDataUseCase: AdminFetchDashboardAppointmentsStatsDataUseCase,
    ) {
        this.fetchTodaysData = this.fetchTodaysData.bind(this);
        this.fetchUserStats = this.fetchUserStats.bind(this);
        this.fetchProviderStats = this.fetchProviderStats.bind(this);
        this.fetchSubscriptionStats = this.fetchSubscriptionStats.bind(this);
        this.fetchRevenueStats = this.fetchRevenueStats.bind(this);
        this.fetchAppointmentsStats = this.fetchAppointmentsStats.bind(this);
    }

    async fetchTodaysData(req: Request, res: Response) {
        try {
            const result = await this.adminFetchDashboardTodaysDataUseCase.execute();
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async fetchUserStats(req: Request, res: Response) {
        try {
            const result = await this.adminFetchDashboardUserStatsDataUseCase.execute();
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async fetchProviderStats(req: Request, res: Response) {
        try {
            const result = await this.adminFetchDashboardProviderStatsDataUseCase.execute();
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async fetchSubscriptionStats(req: Request, res: Response) {
        try {
            const result = await this.adminFetchDashboardSubscriptionStatsDataUseCase.execute();
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async fetchRevenueStats(req: Request, res: Response) {
        try {
            const result = await this.adminFetchDashboardRevenueStatsDataUseCase.execute();
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async fetchAppointmentsStats(req: Request, res: Response) {
        try {
            const result = await this.adminFetchDashboardAppointmentsStatsDataUseCase.execute();
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

}

const adminDashboardController = new AdminDashboardController(
    adminFetchDashboardTodaysDataUseCase,
    adminFetchDashboardUserStatsDataUseCase,
    adminFetchDashboardProviderStatsDataUseCase,
    adminFetchDashboardSubscriptionStatsDataUseCase,
    adminFetchDashboardRevenueStatsDataUseCase,
    adminFetchDashboardAppointmentsStatsDataUseCase
);
export { adminDashboardController }