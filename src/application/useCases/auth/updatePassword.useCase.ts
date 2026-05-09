import { kafkaConfig } from "../../../config/env";
import { UpdatePasswordInput } from "../../dtos/auth.dto";
import { generateId } from '../../../shared/utils/generateId';
import { IJWT } from '../../../domain/interfaces/security/IJwt';
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { notificationContentMap } from '../../../shared/utils/constants';
import { EventEnvelope, SendResetPasswordEvent } from "../../dtos/kafka.dto";
import { BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { IPasswordHasher } from "../../../domain/interfaces/security/IPasswordHasher";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class UpdatePasswordUseCase {
    constructor(
        public readonly userRepository: IUserRepository,
        public readonly passwordHasher: IPasswordHasher,
        public readonly kafkaProducer: IKafkaProducerAdapter,
        public readonly jwtService: IJWT,
    ) { };

    async execute(input: UpdatePasswordInput): Promise<void> {
        try {
            const { token, password } = input;
            if(!token || !password) {
                throw new BadRequestError()
            }

            const { userId, email } = await this.jwtService.verifyToken(token);
            if (!userId || !email) {
                throw new BadRequestError();
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            const hashedPassword = await this.passwordHasher.hashPassword(password);

            user.changePassword({ password: hashedPassword });
            await this.userRepository.update(user);

            await this.kafkaProducer.publish<EventEnvelope<SendResetPasswordEvent>>(kafkaConfig.topics.pub.passwordReset, {
                eventId: generateId({ type: IdType.EVENT }),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    emailData: {
                        email: user.email,
                        name: user.username,
                    },
                    notificationData: {
                        userId: user._id,
                        pushNotification: user.allowPushNotification ?? false,
                        title: notificationContentMap.resetPassword.title,
                        body: notificationContentMap.resetPassword.body(),
                    }
                }
            });

        } catch (error: unknown) {
            throw toAppError(error, "Failed to update password");
        };
    };
};