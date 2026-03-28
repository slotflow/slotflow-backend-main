import { log } from "../../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/utils/response";
import { fetchGraphDataUseCase, fetchStatsUseCase } from "..";
import { DecodedUser } from "../../../application/dtos/common.dto";
import { startAndEndDateSchema } from "../../../shared/zod/common.zod";
import { FetchStatsUseCase } from "../../../application/useCases/provider/dashboard/fetchStats.useCase";
import { FetchGraphDataUseCase } from "../../../application/useCases/provider/dashboard/fetchGraphData.useCase";
import { providerValidateDashboardDataSchema } from "../../../shared/zod/provider.zod";

class ProviderDashboardController {
    constructor(
        private fetchStatsUseCase: FetchStatsUseCase,
        private fetchGraphDataUseCase: FetchGraphDataUseCase,
    ) {
        this.getDashboardStats = this.getDashboardStats.bind(this);
        this.getDashboardGraphData = this.getDashboardGraphData.bind(this);
    };

    async getDashboardStats(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const validatedData = startAndEndDateSchema.parse(req.query);
            const result = await this.fetchStatsUseCase.execute({
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
            const result = await this.fetchGraphDataUseCase.execute({
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
    fetchStatsUseCase,
    fetchGraphDataUseCase
);