import { v4 as uuidv4 } from 'uuid';
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { UpdatePasswordRequest } from "../../dtos/auth.dto";
import { IJWT } from '../../../domain/interfaces/security/IJwt';
import { notificationContentMap } from '../../../shared/utils/constants';
import { EventEnvelope, SendResetPasswordEvent } from "../../dtos/kafka.dtos";
import { IPasswordHasher } from "../../../domain/interfaces/security/IPasswordHasher";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class UpdatePasswordUseCase {
    constructor(
        public readonly userRepository: IUserRepository,
        public readonly providerRepository: IProviderRepository,
        public readonly passwordHasher: IPasswordHasher,
        public readonly kafkaProducer: IKafkaProducerAdapter,
        public readonly jwtService: IJWT,
    ) { };

    async execute(payload: UpdatePasswordRequest): Promise<void> {
        try {
            const { token, password } = payload;

            if (!token || !password) throw new Error("Invalid Request");

            const { userId, email } = await this.jwtService.verifyToken(token);

            if (!userId || !email) throw new Error("Invalid Request");

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("User not found.");

            const hashedPassword = await this.passwordHasher.hashPassword(password);

            user.changePassword({ password: hashedPassword });
            await this.userRepository.update(user);

            await this.kafkaProducer.publish<EventEnvelope<SendResetPasswordEvent>>(kafkaConfig.topics.pub.passwordReset, {
                eventId: uuidv4(),
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

        } catch (error) {
            log.error("UpdatePasswordUseCase failed : ", error as Error);
            throw error;
        };
    };
};