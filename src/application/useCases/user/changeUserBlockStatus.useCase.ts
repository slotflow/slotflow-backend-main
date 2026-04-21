import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { ERROR_CODES } from '../../../shared/utils/types';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { notificationContentMap } from "../../../shared/utils/constants";
import { EventEnvelope, SendAccountBlockStatusEvent } from "../../dtos/kafka.dto";
import { ICacheService } from "../../../domain/interfaces/services/ICache.service";
import { AppError, BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { ChangeUserIsBlockedStatusInput, ChangeUserIsBlockedStatusOutput } from '../../dtos/user.dto';

export class ChangeUserBlockStatusUseCase {
    constructor(
        private userRepository: IUserRepository,
        private kafkaProducer: IKafkaProducerAdapter,
        private cacheService: ICacheService
    ) { };

    async execute(input: ChangeUserIsBlockedStatusInput): Promise<ChangeUserIsBlockedStatusOutput> {
        try {
            const { userId, isBlocked } = input;
            if (!userId) {
                throw new BadRequestError();
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found.",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            if (user.isBlocked === isBlocked) {
                isBlocked ? user.unblock() : user.block();
            };

            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) {
                throw new AppError(
                    "Failed to update block status",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            if (updatedUser.isBlocked) {
                await this.cacheService.setBlockList(userId, JSON.stringify(isBlocked));
            } else {
                await this.cacheService.deleteBlockList(userId);
            };

            await this.kafkaProducer.publish<EventEnvelope<SendAccountBlockStatusEvent>>(kafkaConfig.topics.pub.accountBlockStatus, {
                eventId: uuidv4(),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        email: user.email,
                        name: user.username,
                        blocked: updatedUser.isBlocked,
                    },
                    notificationData: {
                        userId: user._id,
                        pushNotification: user.allowPushNotification ?? false,
                        title: notificationContentMap.accountBlockStatus.title,
                        body: notificationContentMap.accountBlockStatus.body(updatedUser.isBlocked),
                    }
                }
            });

            return { userId, isBlocked: updatedUser.isBlocked };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to change user block status");
        };
    };
};
