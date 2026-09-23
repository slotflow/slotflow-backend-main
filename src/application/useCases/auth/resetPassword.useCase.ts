import { kafkaConfig } from "../../../config/env";
import { ResetPasswordInput } from "../../dtos/auth.dto";
import { IJWT } from '../../interfaces/security/IJwt.service';
import { generateId } from '../../../shared/utils/helpers/generateId';
import { toAppError } from '../../../shared/error/handleUnknownError';
import { ERROR_CODES, IdType } from '../../../shared/utils/types/enums';
import { EventEnvelope, SendResetPasswordEvent } from "../../dtos/kafka.dto";
import { IPasswordHasher } from "../../interfaces/security/IPasswordHasher.service";
import { AppError, BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../interfaces/messaging/IKafkaProducer.adapter";

export class ResetPasswordUseCase {
    constructor(
        public readonly userRepository: IUserRepository,
        public readonly passwordHasher: IPasswordHasher,
        public readonly kafkaProducer: IKafkaProducerAdapter,
        public readonly jwtService: IJWT,
    ) { };

    async execute(input: ResetPasswordInput): Promise<void> {
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
            const updatedUser = await this.userRepository.update(user);
            if(!updatedUser) {
                throw new AppError(
                    "Failed to update user",
                    500,
                    false,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            await this.kafkaProducer.publish<EventEnvelope<SendResetPasswordEvent>>(kafkaConfig.topics.pub.passwordReset, {
                eventId: generateId({ type: IdType.EVENT }),
                attempt: 1,
                maxAttempts: 1,
                occurredAt: new Date(),
                payload: {
                    emailData: {
                        email: user.email,
                        name: user.username,
                    },
                }
            });

        } catch (error: unknown) {
            throw toAppError(error, "Failed to reset password");
        };
    };
};