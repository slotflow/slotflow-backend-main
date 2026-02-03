import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { UpdatePasswordRequest } from "../../dtos/auth.dto";
import { SendResetPasswordEvent } from "../../dtos/kafka.dtos";
import { IPasswordHasher } from "../../../domain/interfaces/security/IPasswordHasher";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class UpdatePasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerRepository: IProviderRepository,
        private passwordHasher: IPasswordHasher,
        private kafkaProducer: IKafkaProducerAdapter
    ) { };

    async execute(payload: UpdatePasswordRequest): Promise<void> {
        try {
            const { role, verificationToken, password } = payload;

            if (!role || !verificationToken || !password) throw new Error("Invalid Request");

            const hashedPassword = await this.passwordHasher.hashPassword(password);

            if (role === Role.USER) {
                const user = await this.userRepository.findByVerificationToken(verificationToken);
                if (!user) throw new Error("User not found.");

                user.changePassword({ password: hashedPassword });
                await this.userRepository.update(user);

                await this.kafkaProducer.publish<SendResetPasswordEvent>(kafkaConfig.topics.pub.passwordReset, {
                    email: user.email,
                    name: user.username,
                });

            } else if (role === Role.PROVIDER) {
                const provider = await this.providerRepository.findByVerificationToken(verificationToken);
                if (!provider) throw new Error("User not found.");

                provider.changePassword({ password: hashedPassword });
                await this.providerRepository.update(provider);

                await this.kafkaProducer.publish<SendResetPasswordEvent>(kafkaConfig.topics.pub.passwordReset, {
                    email: provider.email,
                    name: provider.username,
                });
            };

        } catch (error) {
            log.error("UpdatePasswordUseCase failed : ", error as Error);
            throw error;
        };
    };
};