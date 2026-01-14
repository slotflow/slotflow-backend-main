import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { providerFetchDashboardGraphDataUseCase, providerFetchDashboardStatsUseCase } from ".";
import { providerValidateDashboardDataSchema, validateProviderIdSchema } from "../../shared/zod/provider.zod";
import { ProviderFetchDashboardStatsUseCase } from "../../application/useCases/provier/providerDashboardStats.useCase";
import { ProviderFetchDashboardGraphDataUseCase } from "../../application/useCases/provier/providerDashboardGraphData.useCase";

class ProviderDashboardController {
    constructor(
        private providerFetchDashboardStatsUseCase: ProviderFetchDashboardStatsUseCase,
        private providerFetchDashboardGraphDataUseCase: ProviderFetchDashboardGraphDataUseCase,
    ) {
        this.getDashboardStats = this.getDashboardStats.bind(this);
        this.getDashboardGraphData = this.getDashboardGraphData.bind(this);
    };

    async getDashboardStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse((req.user as DecodedUser).userOrProviderId);
            const result = await this.providerFetchDashboardStatsUseCase.execute({ providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getDashboardStats failed", error as Error);
            next(error);
        };
    };

    async getDashboardGraphData(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId, subscription, endDate, startDate } = providerValidateDashboardDataSchema.parse({
                subscription: req.query.subscription,
                startDate: req.query.start,
                endDate: req.query.end,
                providerId: (req.user as DecodedUser).userOrProviderId
            });
            const result = await this.providerFetchDashboardGraphDataUseCase.execute({
                providerId, 
                subscription: subscription,
                endDate,
                startDate,
            });
            sendResponse(res,result);
        } catch (error) {
            log.error("getDashboardGraphData failed", error as Error);
            next(error);
        };
    };

};

export const providerDashboardController = new ProviderDashboardController(
    providerFetchDashboardStatsUseCase,
    providerFetchDashboardGraphDataUseCase
);