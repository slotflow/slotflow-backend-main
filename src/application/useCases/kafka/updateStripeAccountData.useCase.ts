import { kafkaConfig } from "../../../config/env";
import { generateId } from "../../../shared/utils/generateId";
import { ERROR_CODES, IdType } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, NotFoundError } from "../../../shared/error/appError";
import { notificationContentMap } from "../../../shared/utils/constants";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { EventEnvelope, SendStripeAccountLinkedEvent, StripeAccountCreatedEventInput } from "../../dtos/kafka.dto";

export class UpdateStripeAccountDataUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(input: StripeAccountCreatedEventInput): Promise<void> {
        try {
            const { userId, stripeAccountId } = input;
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }
            user.linkStripeAccount(stripeAccountId);
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) {
                throw new AppError(
                    "Failed to update stripe account id",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            await this.kafkaProducer.publish<EventEnvelope<SendStripeAccountLinkedEvent>>(
                kafkaConfig.topics.pub.stripeAccountLinked, {
                eventId: generateId({ type: IdType.EVENT }),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toString(),
                payload: {
                    notificationData: {
                        userId,
                        title: notificationContentMap.stripeAccountCreated.title,
                        body: notificationContentMap.stripeAccountCreated.body(),
                        pushNotification: false,
                    }
                }
            });
        } catch (error) {
            throw toAppError(error, "Failed to update stripe account id");
        };
    };
};