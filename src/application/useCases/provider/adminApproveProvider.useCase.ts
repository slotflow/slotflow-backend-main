import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { AdminApproveProviderInput } from "../../dtos/admin.dto";
import { notificationContentMap } from "../../../shared/utils/constants";
import { EventEnvelope, SendAdminProviderReviewEvent } from "../../dtos/kafka.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { AdminVerificationStatus } from "../../../domain/enums/adminVerificationStatus.enum";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class AdminApproveProviderUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerProfileRepository: IProviderProfileRepository,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(input: AdminApproveProviderInput): Promise<void> {
        try {
            const { providerId } = input;

            const provider = await this.userRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
            if (!providerProfile) throw new Error("Provider profile not found.");
            if (providerProfile.isAdminVerified) throw new Error("Provider is already verified.");

            provider.completeOnboarding(Role.PROVIDER);
            await this.userRepository.update(provider);

            providerProfile.approveVerification();
            await this.providerProfileRepository.update(providerProfile);

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