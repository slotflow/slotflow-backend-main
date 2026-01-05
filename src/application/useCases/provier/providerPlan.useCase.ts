import { log } from "../../../shared/logger/logger";
import { ProviderFetchAllPlansResponse } from "../../dtos/provider.dto";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class ProviderFetchAllPlansUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { };

    async execute(): Promise<ProviderFetchAllPlansResponse> {
        try {
            const planData = await this.planRepository.findAll();
            if (!planData) throw new Error("Plans Fetching error");
            const { data: plans } = planData;
            return plans.map(plan => ({
                _id: plan._id,
                description: plan.description,
                features: plan.features,
                planName: plan.planName,
                price: plan.price,
            }));
        } catch (error) {
            log.error("ProviderFetchAllPlansUseCase failed", error as Error);
            throw error;
        };
    };

};