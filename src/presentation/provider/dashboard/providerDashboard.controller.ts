import { log } from "../../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/utils/response";
import { getProviderGraphDataUseCase, getProviderStatsUseCase } from "..";
import { DecodedUser } from "../../../application/dtos/common.dto";
import { startAndEndDateSchema } from "../../../shared/zod/common.zod";
import { GetProviderStatsUseCase } from "../../../application/useCases/provider/dashboard/getStats.useCase";
import { GetProviderGraphDataUseCase } from "../../../application/useCases/provider/dashboard/getGraphData.useCase";
import { providerValidateDashboardDataSchema } from "../../../shared/zod/provider.zod";
import { BadRequestError } from "../../../shared/error/appError";
import { ERROR_CODES } from "../../../shared/utils/types";

class ProviderDashboardController {
    constructor(
        private getProviderStatsUseCase: GetProviderStatsUseCase,
        private getProviderGraphDataUseCase: GetProviderGraphDataUseCase,
    ) {
        this.getDashboardStats = this.getDashboardStats.bind(this);
        this.getDashboardGraphData = this.getDashboardGraphData.bind(this);
    };

    async getDashboardStats(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;

            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.getProviderStatsUseCase.execute({
                providerId: user.userOrProviderId,
                ...validatedData,
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("getDashboardStats failed", error as Error);
            next(error);
        };
    };

    async getDashboardGraphData(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            
            const { subscription, endDate, startDate } = providerValidateDashboardDataSchema.parse(req.query);
            const result = await this.getProviderGraphDataUseCase.execute({
                providerId: user.userOrProviderId,
                subscription,
                endDate,
                startDate,
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("getDashboardGraphData failed", error as Error);
            next(error);
        };
    };

};

export const providerDashboardController = new ProviderDashboardController(
    getProviderStatsUseCase,
    getProviderGraphDataUseCase
);