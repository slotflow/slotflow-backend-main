import { AdminVerificationStatus } from "../../../domain/enums/adminVerificationStatus.enum";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { notificationContentMap } from "../../../shared/utils/constants";
import { AdminRejectProviderRequest } from "../../dtos/admin.dto";
import { EventEnvelope, SendAdminProviderReviewEvent } from "../../dtos/kafka.dtos";
import { kafkaConfig } from "../../../config/env";
import { v4 as uuidv4 } from 'uuid';
import { log } from "../../../shared/logger/logger";

export class AdminRejectProviderUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: AdminRejectProviderRequest): Promise<void> {
        try {
            const { providerId, verificationRejectionReason, isAddressVerified, isAvailabilityVerified, isProofsVerified, isServiceDetailsVerified } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            provider.rejectVerification({
                verificationRejectionReason: verificationRejectionReason ?? "",
                isAddressVerified,
                isServiceDetailsVerified,
                isAvailabilityVerified,
                isProofsVerified,
            });

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
                        status: AdminVerificationStatus.REJECTED,
                        reason: provider.verificationRejectionReason ?? undefined,
                    },
                    notificationData: {
                        userId: provider._id,
                        pushNotification: provider.allowPushNotification ?? false,
                        title: notificationContentMap.adminProviderReview.title,
                        body: notificationContentMap.adminProviderReview.body(AdminVerificationStatus.REJECTED),
                    },
                },
            });

        } catch (error) {
            log.error("AdminRejectProviderUseCase failed", error as Error);
            throw error;
        };
    };
};