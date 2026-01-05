import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { providerFetchDashboardGraphDataUseCase, providerFetchDashboardStatsUseCase } from ".";
import { ProviderFetchDashboardStatsUseCase } from "../../application/useCases/provier/providerDashboardStats.useCase";
import { ProviderFetchDashboardGraphDataUseCase } from "../../application/useCases/provier/providerDashboardGraphData.useCase";
import { DecodedUser } from "../../application/dtos/common.dto";
import { PlanName } from "../../domain/enums/planName.enum";

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
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if(!providerId) throw new Error("Invalid request");
            const result = await this.providerFetchDashboardStatsUseCase.execute({ providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getDashboardStats failed", error as Error);
            next(error);
        };
    };

    async getDashboardGraphData(req: Request, res: Response, next: NextFunction) {
        try {
            const subscription = req.query.subscription as PlanName;
            const startDate = req.query.start ? new Date(req.query.start as string) : undefined;
            const endDate = req.query.end ? new Date(req.query.end as string) : undefined;
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if(!providerId) throw new Error("Invalid request");
            const result = await this.providerFetchDashboardGraphDataUseCase.execute({
                providerId, 
                subscription: subscription ?? PlanName.Trial,
                endDate: endDate ? new Date(endDate) : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
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