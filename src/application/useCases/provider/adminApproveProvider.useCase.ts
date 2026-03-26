import { AdminVerificationStatus } from "../../../domain/enums/adminVerificationStatus.enum";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { notificationContentMap } from "../../../shared/utils/constants";
import { AdminApproveProviderRequest } from "../../dtos/admin.dto";
import { EventEnvelope, SendAdminProviderReviewEvent } from "../../dtos/kafka.dtos";
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { v4 as uuidv4 } from 'uuid';

export class AdminApproveProviderUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: AdminApproveProviderRequest): Promise<void> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");
            if (provider.isAdminVerified) throw new Error("Provider is already verified.");

            provider.approveVerification();

            await this.providerRepository.update(provider);

            await this.kafkaProducer.publish<EventEnvelope<SendAdminProviderReviewEvent>>(kafkaConfig.topics.pub.adminProviderReview, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        email: provider.email,
                        name: provider.username,
                        status: AdminVerificationStatus.APPROVED,
                    },
                    notificationData: {
                        userId: provider._id,
                        pushNotification: provider.allowPushNotification ?? false,
                        title: notificationContentMap.adminProviderReview.title,
                        body: notificationContentMap.adminProviderReview.body(AdminVerificationStatus.APPROVED),
                    },
                },
            });

        } catch (error) {
            log.error("AdminApproveProviderUseCase failed", error as Error);
            throw error;
        };
    };
};