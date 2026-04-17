import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { notificationContentMap } from "../../../shared/utils/constants";
import { ICacheService } from "../../../domain/interfaces/services/ICache.service";
import { EventEnvelope, SendAccountBlockStatusEvent } from "../../dtos/kafka.dto";
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

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found.");

            if (user.isBlocked === isBlocked) {
                isBlocked ? user.unblock() : user.block();
            };

            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("User not found");

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
        } catch (error) {
            log.error("ChangeUserBlockStatusUseCase failed", error as Error);
            throw error;
        };
    };
};
