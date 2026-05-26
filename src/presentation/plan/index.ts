import { planRepository } from "../../infrastructure/repositoryImpls";
import { GetPlansUseCase } from "../../application/useCases/plan/getPlans.useCase";
import { CreatePlanUseCase } from "../../application/useCases/plan/createPlan.useCase";
import { ChangePlanBlockStatusUseCase } from "../../application/useCases/plan/changePlanBlockStatus.useCase";

export const getPlansUseCase = new GetPlansUseCase(planRepository);

export const createPlanUseCase = new CreatePlanUseCase(planRepository);

export const changePlanBlockStatusUseCase = new ChangePlanBlockStatusUseCase(planRepository);