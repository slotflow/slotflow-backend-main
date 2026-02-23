import { log } from "../../../shared/logger/logger";
import { EventEnvelope, ProviderSubscriptionUpdatedEvent } from "../../dtos/kafka.dtos";
import { ProviderCreatePaymentSuccessEventResult } from "../../dtos/common.dto";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { getDateAfterMonths } from "../../../shared/utils/dateTime";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { kafkaConfig } from "../../../config/env";
import { v4 as uuidv4 } from 'uuid';
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";


export class UpdateSubscriptionAfterPaymentSuccessUseCase {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly providerRepository: IProviderRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly planRepository: IPlanRepository
    ) { };

    async execute(payload: EventEnvelope<ProviderCreatePaymentSuccessEventResult>) {
        try {

            const {
                payload: {
                    mbsData: {
                        subscriptionId,
                        paymentId,
                        planDuration,
                        providerId
                    }
                }
            } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            provider.pushSubscriptionId(subscriptionId);
            await this.providerRepository.update(provider);

            const subscription = await this.subscriptionRepository.findById(subscriptionId);
            if (!subscription) throw new Error("Subscription not found.");

            const plan = await this.planRepository.findById(subscription.subscriptionPlanId);
            if(!plan) throw new Error("Subscribed plan not found");

            const endDate = getDateAfterMonths(planDuration);

            subscription.subscriptionPaymentSuccess({
                paymentId,
                startDate: new Date(),
                endDate,
            });

            await this.subscriptionRepository.update(subscription);

            await this.kafkaProducer.publish<EventEnvelope<ProviderSubscriptionUpdatedEvent>>(kafkaConfig.topics.pub.providerSubscriptionUpdated, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    ssData: {
                        providerId: provider._id,
                        subscribedPlan: plan.planName,
                        startDate: subscription.startDate,
                        endDate: subscription.endDate,
                        subscriptionStatus: subscription.subscriptionStatus
                    }
                }
            });

        } catch (error) {
            log.error("UpdateSubscriptionAfterPaymentSuccessUseCase failed", error as Error);
        };
    };
};
