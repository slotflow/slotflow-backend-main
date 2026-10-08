import mongoose from 'mongoose';
import { kafkaConfig } from "../../../config/env";
import { generateId } from '../../../shared/utils/helpers/generateId';
import { AdminApproveProviderInput, AdminApproveProviderOutput } from "../../dtos/admin.dto";
import { ERROR_CODES, IdType } from '../../../shared/utils/types/enums';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { AppError, BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { EventEnvelope, SendAdminProviderReviewEvent } from "../../dtos/kafka.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { AdminVerificationStatus } from "../../../domain/enums/adminVerificationStatus.enum";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class AdminApproveProviderUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerProfileRepository: IProviderProfileRepository,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(input: AdminApproveProviderInput): Promise<AdminApproveProviderOutput> {
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

            provider.approvedByAdmin();
            await this.userRepository.update(provider, session);

            providerProfile.approveVerification();
            const updatedProviderProfile = await this.providerProfileRepository.update(providerProfile, session);
            if (!updatedProviderProfile) {
                throw new AppError(
                    "Provider approval error.",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            await this.kafkaProducer.publish<EventEnvelope<SendAdminProviderReviewEvent>>(kafkaConfig.topics.pub.adminProviderReview, {
                eventId: generateId({ type: IdType.EVENT }),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date(),
                payload: {
                    emailData: {
                        email: provider.email,
                        name: provider.username,
                        status: AdminVerificationStatus.APPROVED,
                    },
                },
            });
            await session.commitTransaction();

            const { isAdminVerified, adminVerificationStatus } = updatedProviderProfile?.getProps();

            return {
                _id: provider._id,
                isAdminVerified,
                adminVerificationStatus
            }
        } catch (error: unknown) {
            await session.abortTransaction();
            throw toAppError(error, "Failed to approve provider");
        } finally {
            session.endSession()
        }
    };
};