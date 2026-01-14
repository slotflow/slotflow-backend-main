import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { paginationSchema } from "../../shared/zod/common.zod";
import { adminChangePlanBlockStatusUseCase, adminCreatePlanUseCase, adminPlanListUseCase } from ".";
import { adminChangePlanBlockStatusSchema, adminCreateNewPlanSchema } from "../../shared/zod/admin.zod";
import { AdminChangePlanBlockStatusUseCase, AdminCreatePlanUseCase, AdminPlanListUseCase } from "../../application/useCases/admin/adminPlan.useCase";

class AdminPlanController {
    constructor(
        private adminPlanListUseCase: AdminPlanListUseCase,
        private adminCreatePlanUseCase: AdminCreatePlanUseCase,
        private adminChangePlanBlockStatusUseCase: AdminChangePlanBlockStatusUseCase,
    ) {
        this.getAllPlans = this.getAllPlans.bind(this);
        this.createNewPlan = this.createNewPlan.bind(this);
        this.changePlanBlockStatus = this.changePlanBlockStatus.bind(this);
    };

    async getAllPlans(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = paginationSchema.parse(req.query);
            const result = await this.adminPlanListUseCase.execute({ page, limit });
            sendResponse(res,result);
        } catch (error) {
            log.error("getAllPlans failed", error as Error);
            next(error);
        };
    };

    async createNewPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const validateBody = adminCreateNewPlanSchema.parse(req.body);
            await this.adminCreatePlanUseCase.execute(validateBody);
            sendResponse(res,null,"New plan created", true, 201);
        } catch (error) {
            log.error("createNewPlan failed", error as Error);
            next(error);
        };
    };

    async changePlanBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus, planId } = adminChangePlanBlockStatusSchema.parse({
                planId: req.params.planId,
                blockStatus: req.body.blockStatus
            });
            const result = await this.adminChangePlanBlockStatusUseCase.execute({ planId, isBlocked: blockStatus });
            sendResponse(res,result,`plan ${result.isBlocked ? "blocked" : "unblocked"} successfully`);
        } catch (error) {
            console.log("changePlanBlockStatus error : ", error);
            next(error)
        };
    };

    // TODO UPDATE PLAN
}

export const adminPlanController = new AdminPlanController(
    adminPlanListUseCase,
    adminCreatePlanUseCase,
    adminChangePlanBlockStatusUseCase
);
