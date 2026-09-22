import { CreateStripePlanInput, CreateStripePlanOutput, UpdateStripePlanInput, UpdateStripePlanOutput } from "../../dtos/plan.dto";

export interface IStripePlanService {
    createPlan(params: CreateStripePlanInput): Promise<CreateStripePlanOutput>;
    updatePlan(params: UpdateStripePlanInput): Promise<UpdateStripePlanOutput>;
}
