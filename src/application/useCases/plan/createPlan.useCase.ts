import { CreatePlanInput } from "../../dtos/plan.dto";
import { ERROR_CODES } from "../../../shared/utils/types";
import { Plan } from "../../../domain/entities/plan.entity";
import { AppError, BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class CreatePlanUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { };

    async execute(input: CreatePlanInput): Promise<void> {
        try {
            const { planName, description, price, features, maxBookingPerMonth, adVisibility } = input;

            if (!planName || !description || !price || !features || !maxBookingPerMonth || !adVisibility) {
                throw new BadRequestError();
            }

            const existingPlan = await this.planRepository.findByNameOrPrice(planName, price);
            const responseText: string = existingPlan?.planName === planName ? "name" : "price";
            if (existingPlan) {
                throw new BadRequestError(
                    `Plan with same ${responseText} already exists.`,
                    ERROR_CODES.PLAN_ALREADY_EXIST
                );
            }

            const plan = Plan.create({
                planName,
                description,
                price,
                features,
                maxBookingPerMonth,
                adVisibility,
            });

            const newPlan = await this.planRepository.create(plan);
            if(!newPlan) {
                throw new AppError(
                    "Internal server error",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to create plan");
        };
    };
};