import {
    AdminChangeProviderTrustTagInput,
    AdminChangeProviderTrustTagOutput,
} from "../../dtos/admin.dto";
import { kafkaConfig } from "../../../config/env";
import { generateId } from "../../../shared/utils/generateId";
import { ERROR_CODES, IdType } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { notificationContentMap } from "../../../shared/utils/constants";
import { BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { EventEnvelope, SendAccountTrustStatusEvent } from "../../dtos/kafka.dto";
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

            if (providerProfile.trustedBySlotflow === trustedBySlotflow) {
                trustedBySlotflow ? providerProfile.revokeTrustBadge() : providerProfile.grantTrustBadge();
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
        } catch (error: unknown) {
            throw toAppError(error, "Failed to change provider trust tag status");
        };
    };
};

