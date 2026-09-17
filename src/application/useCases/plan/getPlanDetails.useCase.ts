import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { NotFoundError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetPlanDetailsInput, GetPlanDetailsOutput } from "../../dtos/plan.dto";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class GetPlanDetailsUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { }

    async execute(input: GetPlanDetailsInput): Promise<GetPlanDetailsOutput> {
        try {
            const { planId } = input;

            const plan = await this.planRepository.findById(planId);
            if (!plan) {
                throw new NotFoundError(
                    "Plan not found",
                    ERROR_CODES.PLAN_NOT_FOUND
                )
            }

            const { createdAt, updatedAt, ...planData } = plan.getProps();
            return planData;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get plan details");
        };
    }
}