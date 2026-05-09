import { kafkaConfig } from "../../../config/env";
import { generateId } from '../../../shared/utils/generateId';
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { notificationContentMap } from "../../../shared/utils/constants";
import { BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { EventEnvelope, SendAccountBlockStatusEvent } from "../../dtos/kafka.dto";
import { ICacheService } from "../../../domain/interfaces/services/ICache.service";
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { AdminChangeProviderBlockStatusInput, AdminChangeProviderBlockStatusOutput } from "../../dtos/admin.dto";

export class ChangeProviderBlockStatusUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter,
        private readonly cacheService: ICacheService
    ) { };

    async execute(input: AdminChangeProviderBlockStatusInput): Promise<AdminChangeProviderBlockStatusOutput> {
        try {
            const { providerId, isBlocked } = input;
            if (!providerId) {
                throw new BadRequestError();
            }

            const provider = await this.userRepository.findById(providerId);
            if (!provider) {
                throw new NotFoundError(
                    "User not found.",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            if (provider.isBlocked === isBlocked) {
                isBlocked ? provider.unblock() : provider.block();
            };

            const updatedProvider = await this.userRepository.update(provider);
            if (!updatedProvider) {
                throw new NotFoundError(
                    "Provider not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            if (updatedProvider.isBlocked) {
                await this.cacheService.setBlockList(providerId, JSON.stringify(isBlocked));
            } else {
                await this.cacheService.deleteBlockList(providerId);
            };

            await this.kafkaProducer.publish<EventEnvelope<SendAccountBlockStatusEvent>>(kafkaConfig.topics.pub.accountBlockStatus, {
                eventId: generateId({ type: IdType.EVENT }),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        blocked: updatedProvider.isBlocked,
                        email: provider.email,
                        name: provider.username,
                    },
                    notificationData: {
                        userId: provider._id,
                        pushNotification: provider.allowPushNotification ?? false,
                        title: notificationContentMap.accountBlockStatus.title,
                        body: notificationContentMap.accountBlockStatus.body(updatedProvider.isBlocked),
                    },
                },
            });

            return { providerId, isBlocked: updatedProvider.isBlocked };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to change provider block status");
        };
    };
};