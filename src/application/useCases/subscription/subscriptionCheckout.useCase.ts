import dayjs from "dayjs";
import { ERROR_CODES } from "../../../shared/utils/types";
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { getNumberOfMonths } from "../../../shared/utils/dateTime";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { SubscriptionStatus } from "../../../domain/enums/subscription.enum";
import { SubscriptionCreateSessionIdInput } from "../../dtos/subscription.dto";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IPaymentServiceClient } from "../../../domain/interfaces/clients/IPaymentService.client";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class SubscriptionCheckoutUseCase {
    constructor(
        private planRepository: IPlanRepository,
        private userRepository: IUserRepository,
        private providerProfileRepository: IProviderProfileRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private paymentServiceClient: IPaymentServiceClient,
    ) { };

    async execute(input: SubscriptionCreateSessionIdInput): Promise<string> {
        try {
            const { providerId, planId, planDuration } = input;
            if (!providerId || !planId || !planDuration) {
                throw new BadRequestError();
            }

            const provider = await this.userRepository.findById(providerId);
            if (!provider) {
                throw new NotFoundError(
                    "User not found.",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            const providerProfile = await this.providerProfileRepository.findById(providerId);
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

            const providerLastSubscriptionsId = providerProfile.subscription.at(-1);
            if (providerLastSubscriptionsId) {
                const subscription = await this.subscriptionRepository.findById(providerLastSubscriptionsId!);
                if (subscription?.subscriptionStatus === SubscriptionStatus.ACTIVE) {
                    throw new BadRequestError(
                        "Your subscription is already active.",
                        ERROR_CODES.SUBSCRIPTION_ALREADY_LIVE
                    );
                }
                const isSubscriptionExpired = dayjs().isAfter(dayjs(subscription?.endDate), "day");
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
                    subscriptionPlanId: planId,
                })
            );

            const months: number = getNumberOfMonths(planDuration);

            const { data } = await this.paymentServiceClient.createSubscriptionCheckoutSession({
                subscriptionId: subscription._id.toString(),
                providerId,
                planName: plan.planName,
                description: plan.description,
                planDuration: months,
                unitAmount: plan.price,
                paymentFor: PaymentFor.PROVIDER_SUBSCRIPTION,
                paymentDate: new Date(),
                name: provider.username,
                email: provider.email,
                initialAmount: plan.price * months,
            });

            return data;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to checkout");
        }
    }
};