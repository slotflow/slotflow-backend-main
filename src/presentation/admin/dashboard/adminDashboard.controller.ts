import { log } from "../../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/utils/response";
import { startAndEndDateSchema } from "../../../shared/zod/common.zod";
import { GetUserDataUseCase } from "../../../application/useCases/admin/dashboard/getUsersData.useCase";
import { GetAdminGraphDataUseCase } from "../../../application/useCases/admin/dashboard/getGraphData.useCase";
import { GetBookingsDataUseCase } from "../../../application/useCases/admin/dashboard/getBookingsData.useCase";
import { GetProviderDataUseCase } from "../../../application/useCases/admin/dashboard/getProvidersData.useCase";
import { GetSubscriptionDataUseCase } from "../../../application/useCases/admin/dashboard/getSubscriptionData.useCase";
import { getAdminGraphDataUseCase, getProviderDataUseCase, getSubscriptionDataUseCase, getUserDataUseCase, getBookingsDataUseCase } from "..";

class DashboardController {
    constructor(
        private getUserDataUseCase: GetUserDataUseCase,
        private getProviderDataUseCase: GetProviderDataUseCase,
        private getSubscriptionDataUseCase: GetSubscriptionDataUseCase,
        private getBookingsDataUseCase: GetBookingsDataUseCase,
        private getAdminGraphDataUseCase: GetAdminGraphDataUseCase
    ) {
        this.getUserStats = this.getUserStats.bind(this);
        this.getProviderStats = this.getProviderStats.bind(this);
        this.getSubscriptionStats = this.getSubscriptionStats.bind(this);
        this.getBookingssStats = this.getBookingssStats.bind(this);
        this.getGraphData = this.getGraphData.bind(this);
    };

    async getUserStats(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.getUserDataUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("getUserStats failed", error as Error);
            next(error);
        };
    };

    async getProviderStats(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.getProviderDataUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("getProviderStats failed", error as Error);
            next(error);
        };
    };

    async getSubscriptionStats(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.getSubscriptionDataUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("getSubscriptionStats failed", error as Error);
            next(error);
        };
    };

    async getBookingssStats(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.getBookingsDataUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("getBookingssStats failed", error as Error);
            next(error);
        };
    };

    async getGraphData(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.getAdminGraphDataUseCase.execute(validatedData);
            sendResponse(res, result);
        } catch (error) {
            log.error("getGraphData failed", error as Error);
            next(error);
        };
    };

};

export const dashboardController = new DashboardController(
    getUserDataUseCase,
    getProviderDataUseCase,
    getSubscriptionDataUseCase,
    getBookingsDataUseCase,
    getAdminGraphDataUseCase
);