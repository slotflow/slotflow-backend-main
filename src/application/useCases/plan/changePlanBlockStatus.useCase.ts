import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { ChangePlanBlockStatusInput, ChangePlanBlockStatusOutput } from "../../dtos/plan.dto";

export class ChangePlanBlockStatusUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { };

    async execute(input: ChangePlanBlockStatusInput): Promise<ChangePlanBlockStatusOutput> {
        try {
            const { planId, isBlocked } = input;
            if (!planId) {
                throw new BadRequestError();
            }

            const plan = await this.planRepository.findById(planId);
            if (!plan) {
                throw new NotFoundError(
                    "Plan not found.",
                    ERROR_CODES.PLAN_NOT_FOUND
                );
            }

            if (plan.isBlocked === isBlocked) {
                isBlocked ? plan.unblock() : plan.block();
            };

            const updatedPlan = await this.planRepository.update(plan);
            if (!updatedPlan) {
                throw new AppError(
                    "Failed to update plan.",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            return { planId, isBlocked: updatedPlan.isBlocked };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to chnage plan block status");
        };
    };
};
