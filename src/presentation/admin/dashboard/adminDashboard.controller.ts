import { log } from "../../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/utils/response";
import { FetchUserDataUseCase } from "../../../application/useCases/admin/dashboard/fetchUsersData.useCase";
import { FetchGraphDataUseCase } from "../../../application/useCases/admin/dashboard/fetchGraphData.useCase";
import { FetchTodaysDataUseCase } from "../../../application/useCases/admin/dashboard/fetchTodaysData.useCase";
import { FetchBookingsDataUseCase } from "../../../application/useCases/admin/dashboard/fetchBookingsData.useCase";
import { FetchProviderDataUseCase } from "../../../application/useCases/admin/dashboard/fetchProvidersData.useCase";
import { FetchSubscriptionDataUseCase } from "../../../application/useCases/admin/dashboard/fetchSubscriptionData.useCase";
import { fetchBookingsDataUseCase, fetchGraphDataUseCase, fetchProviderDataUseCase, fetchSubscriptionDataUseCase, fetchTodaysDataUseCase, fetchUserDataUseCase } from "..";

class DashboardController {
    constructor(
        private fetchTodaysDataUseCase: FetchTodaysDataUseCase,
        private fetchUserDataUseCase: FetchUserDataUseCase,
        private fetchProviderDataUseCase: FetchProviderDataUseCase,
        private fetchSubscriptionDataUseCase: FetchSubscriptionDataUseCase,
        private fetchBookingsDataUseCase: FetchBookingsDataUseCase,
        private fetchGraphDataUseCase: FetchGraphDataUseCase
    ) {
        this.fetchTodaysData = this.fetchTodaysData.bind(this);
        this.fetchUserStats = this.fetchUserStats.bind(this);
        this.fetchProviderStats = this.fetchProviderStats.bind(this);
        this.fetchSubscriptionStats = this.fetchSubscriptionStats.bind(this);
        this.fetchBookingssStats = this.fetchBookingssStats.bind(this);
        this.fetchGraphData = this.fetchGraphData.bind(this);
    };

    async fetchTodaysData(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.fetchTodaysDataUseCase.execute();
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchTodaysData failed", error as Error);
            next(error);
        };
    };

    async fetchUserStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.fetchUserDataUseCase.execute();
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchUserStats failed", error as Error);
            next(error);
        };
    };

    async fetchProviderStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.fetchProviderDataUseCase.execute();
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchProviderStats failed", error as Error);
            next(error);
        };
    };

    async fetchSubscriptionStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.fetchSubscriptionDataUseCase.execute();
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchSubscriptionStats failed", error as Error);
            next(error);
        };
    };

    async fetchBookingssStats(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.fetchBookingsDataUseCase.execute();
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchAppointmentsStats failed", error as Error);
            next(error);
        };
    };

    // TODO
    async fetchGraphData(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.fetchGraphDataUseCase.execute();
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchGraphData failed", error as Error);
            next(error);
        };
    };

};

export const dashboardController = new DashboardController(
    fetchTodaysDataUseCase,
    fetchUserDataUseCase,
    fetchProviderDataUseCase,
    fetchSubscriptionDataUseCase,
    fetchBookingsDataUseCase,
    fetchGraphDataUseCase
);