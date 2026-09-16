import { kafkaConfig } from "../../../config/env";
import { generateId } from '../../../shared/utils/generateId';
import { AdminRejectProviderInput, AdminRejectProviderOutput } from "../../dtos/admin.dto";
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { notificationContentMap } from "../../../shared/utils/constants";
import { AppError, BadRequestError, NotFoundError } from '../../../shared/error/appError';
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

    async execute(input: AdminRejectProviderInput): Promise<AdminRejectProviderOutput> {
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

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
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

            const updatedProviderProfile = await this.providerProfileRepository.update(providerProfile);
            if (!updatedProviderProfile) {
                throw new AppError(
                    "Provider rejecting error.",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            await this.kafkaProducer.publish<EventEnvelope<SendAdminProviderReviewEvent>>(kafkaConfig.topics.pub.adminProviderReview, {
                eventId: generateId({ type: IdType.EVENT }),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        email: provider.email,
                        name: provider.username,
                        status: AdminVerificationStatus.REJECTED,
                        reason: updatedProviderProfile.verificationRejectionReason ?? undefined,
                    },
                    notificationData: {
                        userId: provider._id,
                        pushNotification: provider.allowPushNotification ?? false,
                        title: notificationContentMap.adminProviderReview.title,
                        body: notificationContentMap.adminProviderReview.body(AdminVerificationStatus.REJECTED),
                    },
                },
            });

            return {
                _id: providerId,
                isAddressVerified: updatedProviderProfile.isAddressVerified,
                isAvailabilityVerified: updatedProviderProfile.isAvailabilityVerified,
                isProofsVerified: updatedProviderProfile.isProofsVerified,
                isServiceDetailsVerified: updatedProviderProfile.isServiceDetailsVerified
            }

        } catch (error: unknown) {
            throw toAppError(error, "Failed to reject provider");
        };
    };
};