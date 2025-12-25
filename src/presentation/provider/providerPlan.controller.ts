import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { IPlanRepository } from "../../domain/interfaces/repositories/IPlan.repository";
import { PlanRepositoryImpl } from "../../infrastructure/database/plan/plan.repository.impl";
import { ProviderFetchAllPlansUseCase } from "../../application/useCases/provier/providerPlan.useCase";

const planRepository: IPlanRepository = new PlanRepositoryImpl();

const providerFetchAllPlansUseCase = new ProviderFetchAllPlansUseCase(planRepository);

export class ProviderPlanController {
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
