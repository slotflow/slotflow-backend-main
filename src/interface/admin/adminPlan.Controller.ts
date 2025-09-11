import { Types } from "mongoose";
import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
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
        this.addNewPlan = this.addNewPlan.bind(this);
        this.changePlanBlockStatus = this.changePlanBlockStatus.bind(this);
    }

    async getAllPlans(req: Request, res: Response) {
        try {
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminPlanListUseCase.execute({ page, limit });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async addNewPlan(req: Request, res: Response) {
        try {
            const validateBody = AdminAddNewPlanZodSchema.parse(req.body);
            const { planName, description, price, features, maxBookingPerMonth, adVisibility } = validateBody;
            const result = await this.adminCreatePlanUseCase.execute({ planName, description, price, features, maxBookingPerMonth, adVisibility });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async changePlanBlockStatus(req: Request, res: Response) {
        try {
            const { blockStatus } = AdminChangePlanIsBlockStatusZodSchema.parse(req.body);
            const { id: planId } = ValidateObjectId(req.params.planId, "Plan ID");
            const result = await this.adminChangePlanBlockStatusUseCase.execute({ planId: new Types.ObjectId(planId as string), isBlocked: blockStatus });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
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