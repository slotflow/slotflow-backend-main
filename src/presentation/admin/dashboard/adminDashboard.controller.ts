import { log } from "../../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/utils/response";
import { FetchUserDataUseCase } from "../../../application/useCases/admin/dashboard/fetchUsersData.useCase";
import { FetchGraphDataUseCase } from "../../../application/useCases/admin/dashboard/fetchGraphData.useCase";
import { FetchBookingsDataUseCase } from "../../../application/useCases/admin/dashboard/fetchBookingsData.useCase";
import { FetchProviderDataUseCase } from "../../../application/useCases/admin/dashboard/fetchProvidersData.useCase";
import { FetchSubscriptionDataUseCase } from "../../../application/useCases/admin/dashboard/fetchSubscriptionData.useCase";
import { fetchBookingsDataUseCase, fetchGraphDataUseCase, fetchProviderDataUseCase, fetchSubscriptionDataUseCase, fetchUserDataUseCase } from "..";
import { startAndEndDateSchema } from "../../../shared/zod/common.zod";

class DashboardController {
    constructor(
        private fetchUserDataUseCase: FetchUserDataUseCase,
        private fetchProviderDataUseCase: FetchProviderDataUseCase,
        private fetchSubscriptionDataUseCase: FetchSubscriptionDataUseCase,
        private fetchBookingsDataUseCase: FetchBookingsDataUseCase,
        private fetchGraphDataUseCase: FetchGraphDataUseCase
    ) {
        this.fetchUserStats = this.fetchUserStats.bind(this);
        this.fetchProviderStats = this.fetchProviderStats.bind(this);
        this.fetchSubscriptionStats = this.fetchSubscriptionStats.bind(this);
        this.fetchBookingssStats = this.fetchBookingssStats.bind(this);
        this.fetchGraphData = this.fetchGraphData.bind(this);
    };

    async fetchUserStats(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.fetchUserDataUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchUserStats failed", error as Error);
            next(error);
        };
    };

    async fetchProviderStats(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.fetchProviderDataUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchProviderStats failed", error as Error);
            next(error);
        };
    };

    async fetchSubscriptionStats(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.fetchSubscriptionDataUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchSubscriptionStats failed", error as Error);
            next(error);
        };
    };

    async fetchBookingssStats(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.fetchBookingsDataUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchAppointmentsStats failed", error as Error);
            next(error);
        };
    };

    // TODO
    async fetchGraphData(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.fetchGraphDataUseCase.execute();
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchGraphData failed", error as Error);
            next(error);
        };
    };

};

export const dashboardController = new DashboardController(
    fetchUserDataUseCase,
    fetchProviderDataUseCase,
    fetchSubscriptionDataUseCase,
    fetchBookingsDataUseCase,
    fetchGraphDataUseCase
);