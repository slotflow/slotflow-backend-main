import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { PlanName } from "../../../domain/enums/plan.enum";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { UpdatePlanInput, UpdatePlanOutput } from "../../dtos/plan.dto";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IStripePlanService } from "../../../domain/interfaces/services/IStripePlan.service";

export class UpdatePlanUseCase {
    constructor(
        private readonly planRepository: IPlanRepository,
        private readonly stripePlanService: IStripePlanService
    ) { }

    async execute(input: UpdatePlanInput): Promise<UpdatePlanOutput> {
        try {
            const { planId, ...updates } = input;

            const plan = await this.planRepository.findById(planId);
            if (!plan) {
                throw new NotFoundError("Plan not found");
            }

            if (updates.planName && updates.planName !== plan.planName) {
                const existingPlan = await this.planRepository.findByName(updates.planName);
                if (existingPlan && existingPlan._id !== planId) {
                    throw new BadRequestError("Plan with same name already exists.");
                }
            }

            const targetPlanName = updates.planName ?? plan.planName;
            const targetMonthlyPrice = updates.monthlyPrice ?? plan.monthlyPrice;
            const targetYearlyPrice = updates.yearlyPrice ?? plan.yearlyPrice;
            const isTrial = targetPlanName === PlanName.TRIAL;

            if (isTrial && (targetMonthlyPrice !== 0 || targetYearlyPrice !== 0)) {
                throw new BadRequestError("Trial plan must have zero pricing.");
            }

            if (!isTrial && (targetMonthlyPrice <= 0 || targetYearlyPrice <= 0)) {
                throw new BadRequestError("Paid plans must have valid monthly and yearly prices.");
            }

            plan.update({
                ...updates,
            });

            if (!isTrial) {
                const currentStripeDetails = plan.stripePlanDetails;
                /**
                 * If plan was not synced previously on Stripe, create it from scratch
                 */
                if (!currentStripeDetails?.productId) {
                    const createdStripePlan = await this.stripePlanService.createPlan({
                        planName: plan.planName,
                        description: plan.description,
                        monthlyPrice: plan.monthlyPrice,
                        yearlyPrice: plan.yearlyPrice,
                        features: plan.features,
                        maxBookingPerMonth: plan.maxBookingPerMonth,
                    });

                    plan.update({
                        stripePlanDetails: {
                            productId: createdStripePlan.productId,
                            monthlyPriceId: createdStripePlan.monthlyPriceId,
                            yearlyPriceId: createdStripePlan.yearlyPriceId,
                        },
                    });
                    plan.stripeSynced();
                } else {
                    /**
                     * Else updating the existing plan details in stripe
                     */
                    const stripeUpdateResult = await this.stripePlanService.updatePlan({
                        productId: currentStripeDetails.productId,
                        planName: updates.planName,
                        description: updates.description,
                        features: updates.features,
                        maxBookingPerMonth: updates.maxBookingPerMonth,
                        monthlyPrice:
                            updates.monthlyPrice !== undefined
                                ? {
                                    amount: updates.monthlyPrice,
                                    oldPriceId: currentStripeDetails.monthlyPriceId,
                                }
                                : undefined,
                        yearlyPrice:
                            updates.yearlyPrice !== undefined
                                ? {
                                    amount: updates.yearlyPrice,
                                    oldPriceId: currentStripeDetails.yearlyPriceId,
                                }
                                : undefined,
                    });

                    plan.update({
                        stripePlanDetails: {
                            productId: currentStripeDetails.productId,
                            monthlyPriceId: stripeUpdateResult.monthlyPriceId ?? currentStripeDetails.monthlyPriceId,
                            yearlyPriceId: stripeUpdateResult.yearlyPriceId ?? currentStripeDetails.yearlyPriceId,
                        },
                    });
                    plan.stripeSynced();
                }
            }

            const updatedPlan = await this.planRepository.update(plan);
            if (!updatedPlan) {
                throw new AppError(
                    "Internal server error",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            const { createdAt, updatedAt, ...planData } = updatedPlan.getProps();
            return planData;
        } catch (error: unknown) {
            console.log("errrrr : ", error);
            throw toAppError(error, "Failed to create plan");
        };
    };

}