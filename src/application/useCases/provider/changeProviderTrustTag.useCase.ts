import {
    AdminChangeProviderTrustTagRequest,
    AdminChangeProviderTrustTagResponse,
} from "../../dtos/admin.dto";
import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { notificationContentMap } from "../../../shared/utils/constants";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { EventEnvelope, SendAccountTrustStatusEvent } from "../../dtos/kafka.dtos";


export class ChangeProviderTrustTagUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: AdminChangeProviderTrustTagRequest): Promise<AdminChangeProviderTrustTagResponse> {
        try {
            const { providerId, trustedBySlotflow } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            if (provider.trustedBySlotflow === trustedBySlotflow) {
                trustedBySlotflow ? provider.revokeTrustBadge() : provider.grantTrustBadge();
            };

            const updatedProvider = await this.providerRepository.update(provider);
            if (!updatedProvider) throw new Error("Provider not found");

            await this.kafkaProducer.publish<EventEnvelope<SendAccountTrustStatusEvent>>(kafkaConfig.topics.pub.accountTrustStatus, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        email: provider.email,
                        name: provider.username,
                        trusted: updatedProvider.trustedBySlotflow,
                    },
                    notificationData: {
                        userId: provider._id,
                        pushNotification: provider.allowPushNotification ?? false,
                        title: notificationContentMap.accountTrustStatus.title,
                        body: notificationContentMap.accountTrustStatus.body(updatedProvider.trustedBySlotflow),
                    },
                },
            });

            return { providerId, trustedBySlotflow: updatedProvider.trustedBySlotflow };
        } catch (error) {
            log.error("ChangeProviderTrustTagUseCase failed", error as Error);
            throw error;
        };
    };
};

