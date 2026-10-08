import {
    AdminChangeProviderTrustTagInput,
    AdminChangeProviderTrustTagOutput,
} from "../../dtos/admin.dto";
import { kafkaConfig } from "../../../config/env";
import { generateId } from "../../../shared/utils/helpers/generateId";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ERROR_CODES, IdType } from "../../../shared/utils/types/enums";
import { BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { EventEnvelope, SendAccountTrustStatusEvent } from "../../dtos/kafka.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { NotificationType } from "../../../domain/enums/common.enum";

export class ChangeProviderTrustTagUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(input: AdminChangeProviderTrustTagInput): Promise<AdminChangeProviderTrustTagOutput> {
        try {
            const { providerId, trustedBySlotflow } = input;
            if (!providerId) {
                throw new BadRequestError()
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

            if (trustedBySlotflow) {
                providerProfile.grantTrustBadge();
            } else {
                providerProfile.revokeTrustBadge();
            };

            const updatedProviderProfile = await this.providerProfileRepository.update(providerProfile);
            if (!updatedProviderProfile) {
                throw new NotFoundError(
                    "Provider not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            await this.kafkaProducer.publish<EventEnvelope<SendAccountTrustStatusEvent>>(kafkaConfig.topics.pub.accountTrustStatus, {
                eventId: generateId({ type: IdType.EVENT }),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date(),
                payload: {
                    emailData: {
                        email: provider.email,
                        name: provider.username,
                        trusted: updatedProviderProfile.trustedBySlotflow,
                    },
                    notificationData: {
                        userId: provider._id,
                        isTrusted: updatedProviderProfile.trustedBySlotflow.toString(),
                        notificationType: NotificationType.ACCOUNT_ACTIVITY
                    },
                },
            });

            return { _id: providerId, trustedBySlotflow: updatedProviderProfile.trustedBySlotflow };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to change provider trust tag status");
        };
    };
};

