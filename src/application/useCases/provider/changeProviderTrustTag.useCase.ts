import {
    AdminChangeProviderTrustTagInput,
    AdminChangeProviderTrustTagOutput,
} from "../../dtos/admin.dto";
import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { notificationContentMap } from "../../../shared/utils/constants";
import { EventEnvelope, SendAccountTrustStatusEvent } from "../../dtos/kafka.dtos";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";


export class ChangeProviderTrustTagUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(input: AdminChangeProviderTrustTagInput): Promise<AdminChangeProviderTrustTagOutput> {
        try {
            const { providerId, trustedBySlotflow } = input;

            const provider = await this.userRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            const providerProfile = await this.providerProfileRepository.findById(providerId);
            if (!providerProfile) throw new Error("Profile not found.");

            if (providerProfile.trustedBySlotflow === trustedBySlotflow) {
                trustedBySlotflow ? providerProfile.revokeTrustBadge() : providerProfile.grantTrustBadge();
            };

            const updatedProviderProfile = await this.providerProfileRepository.update(providerProfile);
            if (!updatedProviderProfile) throw new Error("Provider not found");

            await this.kafkaProducer.publish<EventEnvelope<SendAccountTrustStatusEvent>>(kafkaConfig.topics.pub.accountTrustStatus, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        email: provider.email,
                        name: provider.username,
                        trusted: updatedProviderProfile.trustedBySlotflow,
                    },
                    notificationData: {
                        userId: provider._id,
                        pushNotification: provider.allowPushNotification ?? false,
                        title: notificationContentMap.accountTrustStatus.title,
                        body: notificationContentMap.accountTrustStatus.body(updatedProviderProfile.trustedBySlotflow),
                    },
                },
            });

            return { providerId, trustedBySlotflow: updatedProviderProfile.trustedBySlotflow };
        } catch (error) {
            log.error("ChangeProviderTrustTagUseCase failed", error as Error);
            throw error;
        };
    };
};

