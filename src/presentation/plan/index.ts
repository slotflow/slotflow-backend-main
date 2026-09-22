import { stripePlanService } from "../../infrastructure/services";
import { planRepository } from "../../infrastructure/repository";
import { GetPlansUseCase } from "../../application/useCases/plan/getPlans.useCase";
import { CreatePlanUseCase } from "../../application/useCases/plan/createPlan.useCase";
import { UpdatePlanUseCase } from "../../application/useCases/plan/updatePlan.useCase";
import { GetPlanDetailsUseCase } from "../../application/useCases/plan/getPlanDetails.useCase";
import { ResyncPlanStripeUseCase } from "../../application/useCases/plan/resyncPlanStripe.useCase";
import { ChangePlanBlockStatusUseCase } from "../../application/useCases/plan/changePlanBlockStatus.useCase";

export const getPlansUseCase = new GetPlansUseCase(planRepository);

export const createPlanUseCase = new CreatePlanUseCase(planRepository, stripePlanService);

export const changePlanBlockStatusUseCase = new ChangePlanBlockStatusUseCase(planRepository);

export const resyncPlanStripeUseCase = new ResyncPlanStripeUseCase(planRepository, stripePlanService);

export const getPlanDetailsUseCase = new GetPlanDetailsUseCase(planRepository);

export const updatePlanUseCase = new UpdatePlanUseCase(planRepository, stripePlanService);