import { isAfter, startOfDay } from "date-fns";
import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { PlanName } from "../../../domain/enums/plan.enum";
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { BillingCycle, SubscriptionStatus } from "../../../domain/enums/subscription.enum";
import { IPaymentServiceClient } from "../../interfaces/clients/IPaymentService.client";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { SubscriptionCreateSessionIdInput, SubscriptionCreateSessionIdOutput } from "../../dtos/subscription.dto";

export class SubscriptionCheckoutUseCase {
    constructor(
        private planRepository: IPlanRepository,
        private providerProfileRepository: IProviderProfileRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private paymentServiceClient: IPaymentServiceClient,
    ) { };

    async execute(input: SubscriptionCreateSessionIdInput): Promise<SubscriptionCreateSessionIdOutput> {
        try {
            const { providerId, planId, billingCycle, email, name, role } = input;
            console.log("input : ", input);

            if (!providerId || !planId || !billingCycle || !email || !name || !role) {
                throw new BadRequestError();
            }

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
            if (!providerProfile) {
                throw new NotFoundError(
                    "Profile not found.",
                    ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
                );
            }

            const plan = await this.planRepository.findById(planId);

            if (!plan) {
                throw new NotFoundError(
                    "Plan not found.",
                    ERROR_CODES.PLAN_NOT_FOUND
                );
            }


            const providerLastSubscriptionId = providerProfile.subscriptions.at(-1);
            if (providerLastSubscriptionId) {
                const subscription = await this.subscriptionRepository.findById(providerLastSubscriptionId!);
                if (!subscription) {
                    throw new AppError(
                        "Failed to create subscription.",
                        500,
                        true,
                        ERROR_CODES.INTERNAL_ERROR
                    );
                }

                if (subscription?.subscriptionStatus === SubscriptionStatus.ACTIVE) {
                    throw new BadRequestError(
                        "Your subscription is already active.",
                        ERROR_CODES.SUBSCRIPTION_ALREADY_LIVE
                    );
                }

                const isSubscriptionExpired = isAfter(
                    startOfDay(new Date()),
                    startOfDay(new Date(subscription?.endDate))
                );
                if (!isSubscriptionExpired) {
                    throw new BadRequestError(
                        "Your subscription is already active.",
                        ERROR_CODES.SUBSCRIPTION_ALREADY_LIVE
                    );
                }
            };

            const subscription = await this.subscriptionRepository.create(
                Subscription.createInitialData({
                    providerId,
                    subscriptionPlanId: plan._id.toString(),
                })
            );
            if (!subscription) {
                throw new AppError(
                    "Failed to create subscription.",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            const price: number = billingCycle === BillingCycle.MONTHLY ? plan.monthlyPrice : plan.yearlyPrice;
            const priceId: string | undefined = billingCycle === BillingCycle.MONTHLY ? plan.stripePlanDetails?.monthlyPriceId : plan.stripePlanDetails?.yearlyPriceId;
            const isTrial: boolean = plan.planName === PlanName.PROFESSIONAL && !providerProfile.hasUsedTrial;
            const trialPeriodDaysToApply: number = (isTrial && !providerProfile.hasUsedTrial) ? plan.trialDays : 0;

            if (!priceId) {
                throw new AppError(
                    "Plan not found.",
                    404,
                    true,
                    ERROR_CODES.PLAN_NOT_FOUND
                );
            }

            const { data } = await this.paymentServiceClient.createSubscriptionCheckoutSession({
                subscriptionData: {
                    subscriptionId: subscription._id.toString(),
                    billingCycle,
                    unitAmount: price,
                    paymentFor: PaymentFor.PROVIDER_SUBSCRIPTION,
                    paymentDate: new Date(),
                    priceId,
                    trialPeriodDays: trialPeriodDaysToApply,
                    alreadyUsedTrial: providerProfile.hasUsedTrial,
                    isTrial
                },
                user: {
                    email,
                    id: providerId,
                    name,
                    role
                }
            });

            return {
                sessionId: data
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to checkout");
        }
    }
};