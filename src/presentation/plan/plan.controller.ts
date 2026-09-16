import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { paginationSchema } from "../../shared/zod/base.zod";
import { AuthUser } from "../../application/dtos/common.dto";
import { GetPlansUseCase } from "../../application/useCases/plan/getPlans.useCase";
import { CreatePlanUseCase } from "../../application/useCases/plan/createPlan.useCase";
import { UpdatePlanUseCase } from "../../application/useCases/plan/updatePlan.useCase";
import { GetPlanDetailsUseCase } from "../../application/useCases/plan/getPlanDetails.useCase";
import { ResyncPlanStripeUseCase } from "../../application/useCases/plan/resyncPlanStripe.useCase";
import { ChangePlanBlockStatusUseCase } from "../../application/useCases/plan/changePlanBlockStatus.useCase";
import { changePlanBlockStatusSchema, createPlanSchema, updatePlanSchema, validatePlanIdSchema } from "../../shared/zod/plan.zod";
import { changePlanBlockStatusUseCase, createPlanUseCase, getPlanDetailsUseCase, getPlansUseCase, resyncPlanStripeUseCase, updatePlanUseCase } from ".";

class PlanController {
    constructor(
        private readonly getPlansUseCase: GetPlansUseCase,
        private readonly createPlanUseCase: CreatePlanUseCase,
        private readonly changePlanBlockStatusUseCase: ChangePlanBlockStatusUseCase,
        private readonly resyncPlanStripeUseCase: ResyncPlanStripeUseCase,
        private readonly getPlanDetailsUseCase: GetPlanDetailsUseCase,
        private readonly updatePlanUseCase: UpdatePlanUseCase
    ) {
        this.getPlans = this.getPlans.bind(this);
        this.createPlan = this.createPlan.bind(this);
        this.changePlanBlockStatus = this.changePlanBlockStatus.bind(this);
        this.resyncStripePlan = this.resyncStripePlan.bind(this);
        this.getPlanDetails = this.getPlanDetails.bind(this);
        this.updatePlan = this.updatePlan.bind(this);
    };

    async getPlans(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const { page, limit } = paginationSchema.parse(req.query);

            let filter: {
                isProvider?: boolean;
            } = {}

            if (user.role === Role.ADMIN) {
                filter.isProvider = false;
            } else {
                filter.isProvider = true;
            }

            const result = await this.getPlansUseCase.execute({
                page,
                limit,
                isProvider: filter.isProvider ?? false
            });
            sendResponse(res, result);
        } catch (error) {
            next(error);
        };
    };

    async createPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const validateBody = createPlanSchema.parse(req.body);
            const result = await this.createPlanUseCase.execute(validateBody);
            sendResponse(res, result, "Plan created", true, 201);
        } catch (error) {
            next(error);
        };
    };

    async changePlanBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { isBlocked, planId } = changePlanBlockStatusSchema.parse({
                planId: req.params.planId,
                blockStatus: req.body.isBlocked
            });
            const result = await this.changePlanBlockStatusUseCase.execute({ planId, isBlocked });
            sendResponse(res, result, `plan ${result.isBlocked ? "blocked" : "unblocked"} successfully`);
        } catch (error) {
            next(error);
        };
    };

    async resyncStripePlan(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("resync");
            const { planId } = validatePlanIdSchema.parse({
                planId: req.params.planId
            });
            const result = await this.resyncPlanStripeUseCase.execute({
                planId
            });
            sendResponse(res, result, `Plan synced with stripe`);
        } catch (error) {
            next(error);
        }
    }

    async getPlanDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { planId } = validatePlanIdSchema.parse({
                planId: req.params.planId
            });
            const result = await this.getPlanDetailsUseCase.execute({
                planId
            });
            sendResponse(res, result);
        } catch (error) {
            next(error);
        }
    }

    async updatePlan(req: Request, res: Response, next: NextFunction) {
        try {
            const { planId } = validatePlanIdSchema.parse({
                planId: req.params.planId
            });
            const validatedData = updatePlanSchema.parse(req.body);
            const result = await this.updatePlanUseCase.execute({
                planId,
                ...validatedData,
        });
            sendResponse(res, result,'Plan updated successfully');
        } catch (error) {
            next(error);
        }
    }

}

export const planController = new PlanController(
    getPlansUseCase,
    createPlanUseCase,
    changePlanBlockStatusUseCase,
    resyncPlanStripeUseCase,
    getPlanDetailsUseCase,
    updatePlanUseCase
)
