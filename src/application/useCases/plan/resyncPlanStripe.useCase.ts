import {
    AppError,
    BadRequestError,
    NotFoundError,
} from "../../../shared/error/appError";
import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { PlanName, StripeSyncStatus } from "../../../domain/enums/plan.enum";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ResyncStripePlanInput, ResyncStripePlanOutput } from "../../dtos/plan.dto";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IStripePlanService } from "../../interfaces/services/IStripePlan.service";

export class ResyncPlanStripeUseCase {
    constructor(
        private readonly planRepository: IPlanRepository,
        private readonly stripePlanService: IStripePlanService
    ) {}

    async execute(input: ResyncStripePlanInput): Promise<ResyncStripePlanOutput> {
        try {
            const { planId } = input;
            const plan = await this.planRepository.findById(planId);

            if (!plan) {
                throw new NotFoundError(
                    "Plan not found",
                    ERROR_CODES.PLAN_NOT_FOUND
                );
            }

            if (!plan.isStripeSyncPending()) {
                throw new BadRequestError(
                    "Only pending Stripe plans can be resynced."
                );
            }
            
            if(plan.planName === PlanName.TRIAL) {
                throw new BadRequestError(
                    "Trial plan can't resync to stripe."
                );
            }

            const stripePlan = await this.stripePlanService.createPlan({
                    planName: plan.planName,
                    description: plan.description,
                    monthlyPrice: plan.monthlyPrice,
                    yearlyPrice: plan.yearlyPrice,
                    features: plan.features,
                    maxBookingPerMonth: plan.maxBookingPerMonth
                });

            plan.update({
                stripePlanDetails: {
                    productId: stripePlan.productId,
                    monthlyPriceId: stripePlan.monthlyPriceId,
                    yearlyPriceId: stripePlan.yearlyPriceId,
                },
                stripeSync: StripeSyncStatus.SYNCED,
            });

            const updatedPlan = await this.planRepository.update(plan);

            if (!updatedPlan) {
                throw new AppError(
                    "Stripe plan was created but failed to update the plan.",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            return {
                _id: updatedPlan._id,
                stripePlanDetails: updatedPlan.stripePlanDetails,
                stripeSync: updatedPlan.stripeSync
            }
        } catch (error: unknown) {
            throw toAppError(
                error,
                "Failed to resync plan with Stripe"
            );
        }
    }
}