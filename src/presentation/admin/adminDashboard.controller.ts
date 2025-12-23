import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { IUserQueries } from "../../application/queries/IUser.queries";
import { IPaymentQueries } from "../../application/queries/IPayment.queries";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { IProviderQueries } from "../../application/queries/IProvider.queries";
import { UserQueriesImpl } from "../../infrastructure/queries/userQueries.impl";
import { ProviderQueryImpl } from "../../infrastructure/queries/providerQueries.impl";
import { PaymentQueriesImpl } from "../../infrastructure/queries/paymentQueries.impl";
import { BookingQueriesImpl } from "../../infrastructure/queries/bookingQueries.impl";
import { ISubscriptionQueries } from "../../application/queries/ISubscription.queries";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { SubscriptionQueriesImpl } from "../../infrastructure/queries/subscriptionQueries.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { AdminFetchDashboardAppointmentsStatsDataUseCase, AdminFetchDashboardProviderStatsDataUseCase, AdminFetchDashboardRevenueStatsDataUseCase, AdminFetchDashboardSubscriptionStatsDataUseCase, AdminFetchDashboardTodaysDataUseCase, AdminFetchDashboardUserStatsDataUseCase } from "../../application/useCases/admin/adminDashboard.useCase";

const userRepository: IUserRepository = new UserRepositoryImpl();
const providerRepository: IProviderRepository = new ProviderRepositoryImpl();

const providerQuerires: IProviderQueries = new ProviderQueryImpl();
const paymentQueries: IPaymentQueries = new PaymentQueriesImpl();
const bookingQueries: IBookingQueries = new BookingQueriesImpl();
const userQueries: IUserQueries = new UserQueriesImpl();
const subscriptionQueries: ISubscriptionQueries = new SubscriptionQueriesImpl()

const adminFetchDashboardTodaysDataUseCase = new AdminFetchDashboardTodaysDataUseCase(userRepository, providerRepository, paymentQueries, bookingQueries);
const adminFetchDashboardUserStatsDataUseCase = new AdminFetchDashboardUserStatsDataUseCase(userQueries);
const adminFetchDashboardProviderStatsDataUseCase = new AdminFetchDashboardProviderStatsDataUseCase(providerQuerires);
const adminFetchDashboardSubscriptionStatsDataUseCase = new AdminFetchDashboardSubscriptionStatsDataUseCase(subscriptionQueries);
const adminFetchDashboardRevenueStatsDataUseCase = new AdminFetchDashboardRevenueStatsDataUseCase(paymentQueries);
const adminFetchDashboardAppointmentsStatsDataUseCase = new AdminFetchDashboardAppointmentsStatsDataUseCase(bookingQueries);

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
        this.fetchGraphData = this.fetchGraphData.bind(this);
    }

    async fetchTodaysData(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardTodaysDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchTodaysData failed", error as Error);
            next(error);
        }
    }

    async fetchUserStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardUserStatsDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchUserStats failed", error as Error);
            next(error);
        }
    }

    async fetchProviderStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardProviderStatsDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchProviderStats failed", error as Error);
            next(error);
        }
    }

    async fetchSubscriptionStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardSubscriptionStatsDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchSubscriptionStats failed", error as Error);
            next(error);
        }
    }

    async fetchRevenueStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardRevenueStatsDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchRevenueStats failed", error as Error);
            next(error);
        }
    }

    async fetchAppointmentsStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardAppointmentsStatsDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchAppointmentsStats failed", error as Error);
            next(error);
        }
    }

    async fetchGraphData(req: Request, res: Response, next: NextFunction) {
        try {
            const result = {};
            res.status(200).json(result);
        } catch (error) {
            log.error("fetchGraphData failed", error as Error);
            next(error);
        }
    }

}

export const adminDashboardController = new AdminDashboardController(
    adminFetchDashboardTodaysDataUseCase,
    adminFetchDashboardUserStatsDataUseCase,
    adminFetchDashboardProviderStatsDataUseCase,
    adminFetchDashboardSubscriptionStatsDataUseCase,
    adminFetchDashboardRevenueStatsDataUseCase,
    adminFetchDashboardAppointmentsStatsDataUseCase
);