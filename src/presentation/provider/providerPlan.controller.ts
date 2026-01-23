import { log } from "../../shared/logger/logger";
import { providerFetchAllPlansUseCase } from ".";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { ProviderFetchAllPlansUseCase } from "../../application/useCases/provider/providerPlan.useCase";

class ProviderPlanController {
    constructor(
        private providerFetchAllPlansUseCase: ProviderFetchAllPlansUseCase,
    ) {
        this.fetchAllPlans = this.fetchAllPlans.bind(this);
    };

    async fetchAllPlans(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.providerFetchAllPlansUseCase.execute();
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchAllPlans failed", error as Error);
            next(error);
        };
    };

};

export const providerPlanController = new ProviderPlanController(
    providerFetchAllPlansUseCase
);
