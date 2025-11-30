import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { PlanRepositoryImpl } from "../../infrastructure/database/plan/plan.repository.impl";
import { RequestQueryCommonZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";
import { AdminAddNewPlanZodSchema, AdminChangePlanIsBlockStatusZodSchema } from "../../infrastructure/zod/admin.zod";
import { AdminChangePlanBlockStatusUseCase, AdminCreatePlanUseCase, AdminPlanListUseCase } from "../../application/admin-use.case/adminPlan.use-case";

const planRepositoryImpl = new PlanRepositoryImpl();

const adminPlanListUseCase = new AdminPlanListUseCase(planRepositoryImpl);
const adminCreatePlanUseCase = new AdminCreatePlanUseCase(planRepositoryImpl);
const adminChangePlanBlockStatusUseCase = new AdminChangePlanBlockStatusUseCase(planRepositoryImpl);

class AdminPlanController {
    constructor(
        private adminPlanListUseCase: AdminPlanListUseCase,
        private adminCreatePlanUseCase: AdminCreatePlanUseCase,
        private adminChangePlanBlockStatusUseCase: AdminChangePlanBlockStatusUseCase,
    ) {
        this.getAllPlans = this.getAllPlans.bind(this);
        this.createNewPlan = this.createNewPlan.bind(this);
        this.changePlanBlockStatus = this.changePlanBlockStatus.bind(this);
    }

    async getAllPlans(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminPlanListUseCase.execute({ page, limit });
            res.status(200).json(result);
        } catch (error) {
            console.log("getAllPlans error : ", error);
            next(error)
        }
    }

    async createNewPlan(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("req.body : ", req.body);
            const validateBody = AdminAddNewPlanZodSchema.parse(req.body);
            const result = await this.adminCreatePlanUseCase.execute(validateBody);
            res.status(200).json(result);
        } catch (error) {
            console.log("createNewPlan error : ", error);
            next(error)
        }
    }

    async changePlanBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus } = AdminChangePlanIsBlockStatusZodSchema.parse(req.body);
            const { id: planId } = ValidateObjectId(req.params.planId, "Plan ID");
            const result = await this.adminChangePlanBlockStatusUseCase.execute({ planId: new Types.ObjectId(planId as string), isBlocked: blockStatus });
            res.status(200).json(result);
        } catch (error) {
            console.log("changePlanBlockStatus error : ", error);
            next(error)
        }
    }

    // TODO UPDATE PLAN
}

const adminPlanController = new AdminPlanController(
    adminPlanListUseCase,
    adminCreatePlanUseCase,
    adminChangePlanBlockStatusUseCase
);
export { adminPlanController };
