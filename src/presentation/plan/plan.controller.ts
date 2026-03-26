import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { paginationSchema } from "../../shared/zod/base.zod";
import { DecodedUser } from "../../application/dtos/common.dto";
import { GetPlansUseCase } from "../../application/useCases/plan/getPlans.useCase";
import { ProviderGetPlansUseCase } from "../../application/useCases/plan/providerGetPlans.useCase";
import { CreatePlanUseCase } from "../../application/useCases/plan/createPlan.useCase";
import { changePlanBlockStatusSchema, createPlanSchema } from "../../shared/zod/plan.zod";
import { ChangePlanBlockStatusUseCase } from "../../application/useCases/plan/changePlanBlockStatus.useCase";
import { changePlanBlockStatusUseCase, createPlanUseCase, getPlansUseCase, providerGetPlansUseCase } from ".";

class PlanController {
    constructor(
        private readonly getPlansUseCase: GetPlansUseCase,
        private readonly providerGetPlansUseCase: ProviderGetPlansUseCase,
        private readonly createPlanUseCase: CreatePlanUseCase,
        private readonly changePlanBlockStatusUseCase: ChangePlanBlockStatusUseCase
    ) {
        this.getPlans = this.getPlans.bind(this);
        this.createPlan = this.createPlan.bind(this);
        this.changePlanBlockStatus = this.changePlanBlockStatus.bind(this);
    };

    async getPlans(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            if (user.role === Role.ADMIN) {
                const { page, limit } = paginationSchema.parse(req.query);
                const result = await this.getPlansUseCase.execute({ page, limit });
                sendResponse(res, result);
            }

            if (user.role === Role.PROVIDER) {
                const result = await this.providerGetPlansUseCase.execute();
                sendResponse(res, result);
            }
        } catch (error) {
            log.error("getAllPlans failed", error as Error);
            next(error);
        };
    };

    async createPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const validateBody = createPlanSchema.parse(req.body);
            await this.createPlanUseCase.execute(validateBody);
            sendResponse(res, null, "Plan created", true, 201);
        } catch (error) {
            log.error("createPlan failed", error as Error);
            next(error);
        };
    };

    async changePlanBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus, planId } = changePlanBlockStatusSchema.parse({
                planId: req.params.planId,
                blockStatus: req.body.blockStatus
            });
            const result = await this.changePlanBlockStatusUseCase.execute({ planId, isBlocked: blockStatus });
            sendResponse(res, result, `plan ${result.isBlocked ? "blocked" : "unblocked"} successfully`);
        } catch (error) {
            console.log("changePlanBlockStatus error : ", error);
            next(error)
        };
    };

}

export const planController = new PlanController(
    getPlansUseCase,
    providerGetPlansUseCase,
    createPlanUseCase,
    changePlanBlockStatusUseCase,
)
