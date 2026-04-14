import { log } from "../../../shared/logger/logger";
import { ProviderGetPlansOutput } from "../../dtos/plan.dto";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class ProviderGetPlansUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { };

    async execute(): Promise<ProviderGetPlansOutput> {
        try {
            const planData = await this.planRepository.findAll();
            if (!planData) throw new Error("Failed to find plans");
            const { data: plans } = planData;
            return plans.map(plan => ({
                _id: plan._id,
                description: plan.description,
                features: plan.features,
                planName: plan.planName,
                price: plan.price,
            }));
        } catch (error) {
            log.error("ProviderGetPlansUseCase failed", error as Error);
            throw error;
        };
    };
};