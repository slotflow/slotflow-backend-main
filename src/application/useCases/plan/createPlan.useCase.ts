import { log } from "../../../shared/logger/logger";
import { CreatePlanInput } from "../../dtos/plan.dto";
import { Plan } from "../../../domain/entities/plan.entity";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class CreatePlanUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { };

    async execute(input: CreatePlanInput): Promise<void> {
        try {
            const { planName, description, price, features, maxBookingPerMonth, adVisibility } = input;

            const existingPlan = await this.planRepository.findByNameOrPrice(planName, price);
            const responseText: string = existingPlan?.planName === planName ? "name" : "price";
            if (existingPlan) throw new Error(`Plan with same ${responseText} already exists.`);

            const plan = Plan.create({
                planName,
                description,
                price,
                features,
                maxBookingPerMonth,
                adVisibility,
            });

            await this.planRepository.create(plan);
        } catch (error) {
            log.error("CreatePlanUseCase failed", error as Error);
            throw error;
        };
    };
};