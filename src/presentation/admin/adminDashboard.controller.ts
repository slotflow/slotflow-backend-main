import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { adminFetchDashboardAppointmentsStatsDataUseCase, adminFetchDashboardProviderStatsDataUseCase, adminFetchDashboardRevenueStatsDataUseCase, adminFetchDashboardSubscriptionStatsDataUseCase, adminFetchDashboardTodaysDataUseCase, adminFetchDashboardUserStatsDataUseCase } from ".";
import { AdminFetchDashboardAppointmentsStatsDataUseCase, AdminFetchDashboardProviderStatsDataUseCase, AdminFetchDashboardRevenueStatsDataUseCase, AdminFetchDashboardSubscriptionStatsDataUseCase, AdminFetchDashboardTodaysDataUseCase, AdminFetchDashboardUserStatsDataUseCase } from "../../application/useCases/admin/adminDashboard.useCase";

class AdminDashboardController {
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
    };

    async fetchTodaysData(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardTodaysDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchTodaysData failed", error as Error);
            next(error);
        };
    };

    async fetchUserStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardUserStatsDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchUserStats failed", error as Error);
            next(error);
        };
    };

    async fetchProviderStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardProviderStatsDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchProviderStats failed", error as Error);
            next(error);
        };
    };

    async fetchSubscriptionStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardSubscriptionStatsDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchSubscriptionStats failed", error as Error);
            next(error);
        };
    };

    async fetchRevenueStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardRevenueStatsDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchRevenueStats failed", error as Error);
            next(error);
        };
    };

    async fetchAppointmentsStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.adminFetchDashboardAppointmentsStatsDataUseCase.execute();
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchAppointmentsStats failed", error as Error);
            next(error);
        };
    };

    async fetchGraphData(req: Request, res: Response, next: NextFunction) {
        try {
            // TODO
            const result = {};
            res.status(200).json(result);
        } catch (error) {
            log.error("fetchGraphData failed", error as Error);
            next(error);
        };
    };

};

export const adminDashboardController = new AdminDashboardController(
    adminFetchDashboardTodaysDataUseCase,
    adminFetchDashboardUserStatsDataUseCase,
    adminFetchDashboardProviderStatsDataUseCase,
    adminFetchDashboardSubscriptionStatsDataUseCase,
    adminFetchDashboardRevenueStatsDataUseCase,
    adminFetchDashboardAppointmentsStatsDataUseCase
);