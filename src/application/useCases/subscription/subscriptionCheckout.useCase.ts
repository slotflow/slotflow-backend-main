import dayjs from "dayjs";
import { log } from "../../../shared/logger/logger";
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { getNumberOfMonths } from "../../../shared/utils/dateTime";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { SubscriptionStatus } from "../../../domain/enums/subscription.enum";
import { SubscriptionCreateSessionIdRequest } from "../../dtos/subscription";
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

    async execute(payload: SubscriptionCreateSessionIdRequest): Promise<string> {
        try {
            const { providerId, planId, planDuration } = payload;

            const provider = await this.userRepository.findById(providerId);
            if (!provider) throw new Error("No user found, please logout and try again.");

            const providerProfile = await this.providerProfileRepository.findById(providerId);
            if (!providerProfile) throw new Error("Profile not found.");

            const plan = await this.planRepository.findById(planId);
            if (!plan) throw new Error("Unexpected error, please try again after sometimes.");

            const providerLastSubscriptionsId = providerProfile.subscription.at(-1);
            if (providerLastSubscriptionsId) {
                const subscription = await this.subscriptionRepository.findById(providerLastSubscriptionsId!);
                if (subscription?.subscriptionStatus === SubscriptionStatus.ACTIVE) throw new Error("Your subscription is already active.");
                const isSubscriptionExpired = dayjs().isAfter(dayjs(subscription?.endDate), "day");
                if (!isSubscriptionExpired) throw new Error("Your subscription is already active.");
            };

            const subscription = await this.subscriptionRepository.create(
                Subscription.createInitialData({
                    providerId,
                    subscriptionPlanId: planId,
                })
            );

            const months: number = getNumberOfMonths(planDuration);

            const { data } = await this.paymentServiceClient.createSubsciptionCheckoutSession({
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
        } catch (error) {
            log.error("SubscriptionCheckoutUseCase failed", error as Error);
            throw error;
        }
    }
};