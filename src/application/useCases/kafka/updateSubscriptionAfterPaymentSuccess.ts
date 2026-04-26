import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { IdType } from '../../../shared/utils/types';
import { generateId } from '../../../shared/utils/generateId';
import { getDateAfterMonths } from "../../../shared/utils/dateTime";
import { notificationContentMap } from "../../../shared/utils/constants";
import { ProviderCreatePaymentSuccessEventInput } from "../../dtos/kafka.dto";
import { EventEnvelope, ProviderSubscriptionUpdatedEvent } from "../../dtos/kafka.dto";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";


export class UpdateSubscriptionAfterPaymentSuccessUseCase {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly userRepository: IUserRepository,
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly planRepository: IPlanRepository
    ) { };

    async execute(input: ProviderCreatePaymentSuccessEventInput): Promise<void> {
        try {

            const {
                subscriptionId,
                paymentId,
                planDuration,
                providerId
            } = input;

            const provider = await this.userRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
            if (!providerProfile) throw new Error("Provider profile not found.");

            providerProfile.pushSubscriptionId(subscriptionId);
            await this.providerProfileRepository.update(providerProfile);

            const subscription = await this.subscriptionRepository.findById(subscriptionId);
            if (!subscription) throw new Error("Subscription not found.");

            const plan = await this.planRepository.findById(subscription.subscriptionPlanId);
            if (!plan) throw new Error("Subscribed plan not found");

            const endDate = getDateAfterMonths(planDuration);

            subscription.subscriptionPaymentSuccess({
                paymentId,
                startDate: new Date(),
                endDate,
            });

            await this.subscriptionRepository.update(subscription);

            await this.kafkaProducer.publish<EventEnvelope<ProviderSubscriptionUpdatedEvent>>(
                kafkaConfig.topics.pub.planSubscribed, {
                eventId: generateId(IdType.EVENT),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    socketData: {
                        providerId: provider._id,
                        subscribedPlan: plan.planName,
                        startDate: subscription.startDate,
                        endDate: subscription.endDate,
                        subscriptionStatus: subscription.subscriptionStatus
                    },
                    emailData: {
                        email: provider.email,
                        name: provider.username,
                        subscribedPlan: plan.planName,
                        startDate: subscription.startDate,
                        endDate: subscription.endDate
                    },
                    notificationData: {
                        userId: provider._id,
                        pushNotification: provider.allowPushNotification ?? false,
                        title: notificationContentMap.planSubscribed.title,
                        body: notificationContentMap.planSubscribed.body()
                    }
                }
            });

        } catch (error) {
            log.error("UpdateSubscriptionAfterPaymentSuccessUseCase failed", error as Error);
        };
    };
};
