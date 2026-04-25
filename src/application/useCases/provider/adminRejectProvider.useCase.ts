import { kafkaConfig } from "../../../config/env";
import { generateId } from '../../../shared/utils/generateId';
import { AdminRejectProviderInput } from "../../dtos/admin.dto";
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { notificationContentMap } from "../../../shared/utils/constants";
import { BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { EventEnvelope, SendAdminProviderReviewEvent } from "../../dtos/kafka.dto";
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

    async execute(input: AdminRejectProviderInput): Promise<void> {
        try {
            const { providerId, verificationRejectionReason, isAddressVerified, isAvailabilityVerified, isProofsVerified, isServiceDetailsVerified } = input;
            if (!providerId ||
                !verificationRejectionReason
            ) {
                throw new BadRequestError();
            }

            const provider = await this.userRepository.findById(providerId);
            if (!provider) {
                throw new NotFoundError(
                    "User not found.",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            const providerProfile = await this.providerProfileRepository.findById(providerId);
            if (!providerProfile) {
                throw new NotFoundError(
                    "Profile not found.",
                    ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
                );
            }

            providerProfile.rejectVerification({
                verificationRejectionReason: verificationRejectionReason ?? "",
                isAddressVerified,
                isServiceDetailsVerified,
                isAvailabilityVerified,
                isProofsVerified,
            });

            await this.providerProfileRepository.update(providerProfile);

            await this.kafkaProducer.publish<EventEnvelope<SendAdminProviderReviewEvent>>(kafkaConfig.topics.pub.adminProviderReview, {
                eventId: generateId(IdType.EVENT),
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

        } catch (error: unknown) {
            throw toAppError(error, "Failed to reject provider");
        };
    };
};