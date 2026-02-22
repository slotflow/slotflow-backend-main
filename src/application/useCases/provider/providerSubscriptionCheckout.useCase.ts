import dayjs from "dayjs";
import {
    ProviderStripeSubscriptionCreateSessionIdRequest,
    ProviderStripeSubscriptionCreateSessionIdResponse,
} from "../../dtos/provider.dto";
import { log } from "../../../shared/logger/logger";
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { getNumberOfMonths } from "../../../shared/utils/dateTime";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { SubscriptionStatus } from "../../../domain/enums/subscription.enum";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IPaymentServiceClient } from "../../../domain/interfaces/clients/IPaymentService.client";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class ProviderSubscriptionCheckoutUseCase {
    constructor(
        private planRepository: IPlanRepository,
        private providerRepository: IProviderRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private paymentServiceClient: IPaymentServiceClient,
    ) { };

    async execute(payload: ProviderStripeSubscriptionCreateSessionIdRequest): Promise<string> {
        try {
            const { providerId, planId, planDuration } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("No user found, please logout and try again.");

            const plan = await this.planRepository.findById(planId);
            if (!plan) throw new Error("Unexpected error, please try again after sometimes.");

            const providerLastSubscriptionsId = provider.subscription.at(-1);
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

            const { data } = await this.paymentServiceClient.createCheckoutSession({
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
            console.log("sessionId : ", data);

            return data;
        } catch (error) {
            log.error("ProviderSubscriptionCheckoutUseCase failed", error as Error);
            throw error;
        }
    }
};