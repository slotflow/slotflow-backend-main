import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { notificationContentMap } from "../../../shared/utils/constants";
import { ProviderTrialSubscriptionRequest } from "../../dtos/provider.dto";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { EventEnvelope, SendProviderTrialSubscriptionEvent } from "../../dtos/kafka.dtos";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { SubscriptionStatus, SubscriptionValidity } from "../../../domain/enums/subscription.enum";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { getDateAfterDays, getUtcDateRange, isSubscriptionExpired } from "../../../shared/utils/dateTime";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class ProviderTrialSubscriptionUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private planRepository: IPlanRepository,
        private kafkaProducer: IKafkaProducerAdapter
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
                if (subscription) {
                    const isExpired = isSubscriptionExpired(subscription.endDate);
                    if (!isExpired) throw new Error("Your current subscription is on live.");
                }
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
                endDate: getDateAfterDays(SubscriptionValidity.SEVEN_DAYS),
                subscriptionStatus: SubscriptionStatus.ACTIVE,
            });

            const subscription = await this.subscriptionRepository.create(subscriptionData);
            if (!subscription) throw new Error("Trial plan activating error.");

            provider.pushSubscriptionId(subscription._id);
            const updatedProvider = await this.providerRepository.update(provider);
            if (!updatedProvider) throw new Error("Trail plan activating error.");

            const { startDate, endDate } = getUtcDateRange(subscription.startDate, subscription.endDate);

            await this.kafkaProducer.publish<EventEnvelope<SendProviderTrialSubscriptionEvent>>(kafkaConfig.topics.pub.providerTrialSubscription, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        email: provider.email,
                        name: provider.username,
                        startDate,
                        endDate,
                    },
                    notificationData: {
                        userId: provider._id,
                        pushNotification: false,
                        title: notificationContentMap.providerTrialSubscription.title,
                        body: notificationContentMap.providerTrialSubscription.body(),
                    }
                }
            });

        } catch (error) {
            log.error("ProviderTrialSubscriptionUseCase failed", error as Error);
            throw error;
        };
    };
};