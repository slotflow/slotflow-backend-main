import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { AdminAddNewPlanZodSchema } from "../../shared/zod/admin.zod";
import { adminChangePlanBlockStatusUseCase, adminCreatePlanUseCase, adminPlanListUseCase } from ".";
import { changeBlockStatusZodSchema, RequestQueryCommonZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
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
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminPlanListUseCase.execute({ page, limit });
            sendResponse(res,result);
        } catch (error) {
            log.error("getAllPlans failed", error as Error);
            next(error);
        };
    };

    async createNewPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const validateBody = AdminAddNewPlanZodSchema.parse(req.body);
            await this.adminCreatePlanUseCase.execute(validateBody);
            sendResponse(res,null,"New plan created", true, 201);
        } catch (error) {
            log.error("createNewPlan failed", error as Error);
            next(error);
        };
    };

    async changePlanBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus } = changeBlockStatusZodSchema.parse(req.body);
            const { id: planId } = ValidateObjectId(req.params.planId, "Plan ID");
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
