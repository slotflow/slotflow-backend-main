import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { Role } from "../../../domain/enums/common.enum";
import { ERROR_CODES } from '../../../shared/utils/types';
import { AdminApproveProviderInput } from "../../dtos/admin.dto";
import { toAppError } from '../../../shared/error/handleUnknownError';
import { notificationContentMap } from "../../../shared/utils/constants";
import { BadRequestError, NotFoundError } from '../../../shared/error/appError';
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
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { providerId } = input;
            if (!providerId) {
                throw new BadRequestError(
                    "Invalid request",
                    ERROR_CODES.INVALID_REQUEST
                )
            }

            const provider = await this.userRepository.findById(providerId);
            if (!provider) {
                throw new NotFoundError(
                    "User not found.",
                    ERROR_CODES.USER_NOT_FOUND
                )
            }

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
            if (!providerProfile) {
                throw new NotFoundError(
                    "Provider profile not found.",
                    ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
                )
            }
            if (providerProfile.isAdminVerified) {
                throw new BadRequestError(
                    "Provider is already verified.",
                    ERROR_CODES.PROVIDER_ALREADY_VERIFIED
                )
            }

            provider.completeOnboarding(Role.PROVIDER);
            await this.userRepository.update(provider, session);

            providerProfile.approveVerification();
            await this.providerProfileRepository.update(providerProfile, session);

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
            await session.commitTransaction();
        } catch (error: unknown) {
            await session.abortTransaction();
            throw toAppError(error, "Failed to approve provider");
        } finally {
            session.endSession()
        }
    };
};