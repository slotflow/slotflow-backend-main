import { kafkaConfig } from "../../../config/env";
import { UpdatePasswordInput } from "../../dtos/user.dto";
import { NotificationType } from "../../../domain/enums/common.enum";
import { generateId } from "../../../shared/utils/helpers/generateId";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ERROR_CODES, IdType } from "../../../shared/utils/types/enums";
import { EventEnvelope, SendUpdatePasswordEvent } from "../../dtos/kafka.dto";
import { IPasswordHasher } from "../../interfaces/security/IPasswordHasher.service";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";

export class UpdatePasswordUseCase {
    constructor(
        public readonly userRepository: IUserRepository,
        public readonly passwordHasher: IPasswordHasher,
        public readonly kafkaProducer: IKafkaProducerAdapter,
    ) { }

    async execute(input: UpdatePasswordInput): Promise<void> {
        try {
            const { userId, currentPassword, newPassword } = input;

            if (!userId || !currentPassword || !newPassword) {
                throw new BadRequestError();
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                )
            }

            if (!user.password) {
                throw new BadRequestError();
            }

            const isMatch = await this.passwordHasher.comparePassword(
                currentPassword,
                user.password
            );

            if (!isMatch) {
                throw new BadRequestError(
                    "Current password is incorrect",
                    ERROR_CODES.INVALID_CREDENTIALS
                );
            }

            if (currentPassword === newPassword) {
                throw new BadRequestError(
                    "New password must be different",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            const hashedPassword = await this.passwordHasher.hashPassword(newPassword);

            user.changePassword({
                password: hashedPassword
            });
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) {
                throw new AppError(
                    "Failed to update user",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            await this.kafkaProducer.publish<EventEnvelope<SendUpdatePasswordEvent>>(kafkaConfig.topics.pub.passwordUpdate, {
                eventId: generateId({ type: IdType.EVENT }),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date(),
                payload: {
                    notificationData: {
                        userId: user._id,
                        notificationType: NotificationType.ACCOUNT_ACTIVITY
                    }
                }
            });

        } catch (error: unknown) {
            throw toAppError(error, "Failed to update password");
        }
    }
}