import { ProviderGetPlansOutput } from "../../dtos/plan.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class ProviderGetPlansUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { };

    async execute(): Promise<ProviderGetPlansOutput> {
        try {
            const planData = await this.planRepository.findAll();
            const { data: plans } = planData;

            if (!plans || plans.length === 0) {
                return [];
            }

            return plans.map(plan => ({
                _id: plan._id,
                description: plan.description,
                features: plan.features,
                planName: plan.planName,
                price: plan.price,
            }));
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get plans");
        };
    };
};