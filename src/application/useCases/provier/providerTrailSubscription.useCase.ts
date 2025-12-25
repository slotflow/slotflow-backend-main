import dayjs from "dayjs";
import { log } from "../../../shared/logger/logger";
import { ProviderTrialSubscriptionRequest } from "../../dtos/provider.dto";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { SubscriptionStatus } from "../../../domain/enums/subscriptionStatus.enum";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class ProviderTrialSubscriptionUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private planRepository: IPlanRepository,
    ) { };

    async execute(payload: ProviderTrialSubscriptionRequest): Promise<void> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            const providerSubscriptions = provider.subscription;
            if (providerSubscriptions.length > 0) {
                const providerLastSubscriptionId = providerSubscriptions.pop();
                const subscription = await this.subscriptionRepository.findById(providerLastSubscriptionId!);
                const isSubscriptionExpired = dayjs().isAfter(dayjs(subscription?.endDate), "day");
                if (!isSubscriptionExpired) throw new Error("Your current subscription is on live.");
            };

            const trialPlan = await this.planRepository.findByNameOrPrice("TRIAL", 0);
            if (!trialPlan) throw new Error("No trial plan found.");

            const trialPlanId = trialPlan._id;
            const checkTrialIsAlreadyUsed = providerSubscriptions.includes(trialPlanId);
            if (checkTrialIsAlreadyUsed) throw new Error("You have already used the free trial, please go for the paid plan.");

            const subscriptionData = Subscription.create({
                providerId,
                subscriptionPlanId: trialPlanId,
                startDate: new Date(),
                endDate: dayjs().add(Number(7), "day").toDate(),
                subscriptionStatus: SubscriptionStatus.Active,
                paymentId: "",
            });

            const subscription = await this.subscriptionRepository.create(subscriptionData);
            if (!subscription) throw new Error("Trial plan activating error.");

            provider.activateSubscription(subscription._id);
            const updatedProvider = await this.providerRepository.update(provider);
            if (!updatedProvider) throw new Error("Trail plan activating error.");

        } catch (error) {
            log.error("ProviderTrialSubscriptionUseCase failed", error as Error);
            throw error;
        };
    };
};