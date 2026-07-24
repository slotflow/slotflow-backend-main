import { kafkaConfig } from "../../../config/env";
import { generateId } from "../../../shared/utils/generateId";
import { ERROR_CODES, IdType } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, NotFoundError } from "../../../shared/error/appError";
import { notificationContentMap } from "../../../shared/utils/constants";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { EventEnvelope, SendStripeAccountStatusUpdatedEvent, StripeAccountUpdateStatusEventInput } from "../../dtos/kafka.dto";

export class UpdateStripeAccountStatusUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { }

    async execute(input: StripeAccountUpdateStatusEventInput): Promise<void> {
        try {
            const { accountStatus, userId } = input;
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }
            user.updateStripeAccountStatus(accountStatus);
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) {
                throw new AppError(
                    "Failed to update stripe account status",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            await this.kafkaProducer.publish<EventEnvelope<SendStripeAccountStatusUpdatedEvent>>(
                kafkaConfig.topics.pub.stripeAccountStatusUpdated, {
                eventId: generateId({type: IdType.EVENT}),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toString(),
                payload: {
                    socketData: {
                        userId,
                        accountStatus: updatedUser.stripeAccountStatus,
                    },
                    notificationData: {
                        userId,
                        title: notificationContentMap.stripeAccountStatusUpdated.title,
                        body: notificationContentMap.stripeAccountStatusUpdated.body(updatedUser.stripeAccountStatus),
                        pushNotification: false,
                    }
                }
            });
        } catch (error: unknown) {
            throw toAppError(error, "Failed to update stripe account status");
        }
    }
}