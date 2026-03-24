import { log } from "../../../shared/logger/logger";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { ChangePlanBlockStatusRequest, ChangePlanBlockStatusResponse } from "../../dtos/plan.dto";

export class ChangePlanBlockStatusUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { };

    async execute(payload: ChangePlanBlockStatusRequest): Promise<ChangePlanBlockStatusResponse> {
        try {
            const { planId, isBlocked } = payload;

            const plan = await this.planRepository.findById(planId);
            if (!plan) throw new Error("Plan does not exists.");

            if(plan.isBlocked === isBlocked) {
                isBlocked ? plan.unblock() : plan.block();
            };

            const updatedPlan = await this.planRepository.update(plan);

            return { planId, isBlocked: updatedPlan.isBlocked };
        } catch (error) {
            log.error("AdminChangePlanBlockStatusUseCase failed", error as Error);
            throw error;
        };
    };
};
