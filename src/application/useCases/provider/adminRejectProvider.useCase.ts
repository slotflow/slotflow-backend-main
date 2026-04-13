import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { AdminRejectProviderRequest } from "../../dtos/admin.dto";
import { notificationContentMap } from "../../../shared/utils/constants";
import { EventEnvelope, SendAdminProviderReviewEvent } from "../../dtos/kafka.dtos";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { AdminVerificationStatus } from "../../../domain/enums/adminVerificationStatus.enum";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class AdminRejectProviderUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: AdminRejectProviderRequest): Promise<void> {
        try {
            const { providerId, verificationRejectionReason, isAddressVerified, isAvailabilityVerified, isProofsVerified, isServiceDetailsVerified } = payload;

            const provider = await this.userRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            const providerProfile = await this.providerProfileRepository.findById(providerId);
            if (!providerProfile) throw new Error("Profile not found.");

            providerProfile.rejectVerification({
                verificationRejectionReason: verificationRejectionReason ?? "",
                isAddressVerified,
                isServiceDetailsVerified,
                isAvailabilityVerified,
                isProofsVerified,
            });

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
                        status: AdminVerificationStatus.REJECTED,
                        reason: providerProfile.verificationRejectionReason ?? undefined,
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