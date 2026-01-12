import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/role.enum";
import { SendEmailCommon } from "../../dtos/kafka.dtos";
import { UpdatePasswordRequest } from "../../dtos/auth.dto";
import { IPasswordHasher } from "../../../domain/interfaces/security/IPasswordHasher";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/message/IKafkaProducerAdapter";
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

            if (role === Role.User) {
                const user = await this.userRepository.findByVerificationToken(verificationToken);
                if (!user) throw new Error("User not found.");

                user.changePassword({ password: hashedPassword });
                await this.userRepository.update(user);

                await this.kafkaProducer.publish<SendEmailCommon>(kafkaConfig.topics.pub.passwordReset, {
                    email: user.email,
                    name: user.username
                });

            } else if (role === Role.Provider) {
                const provider = await this.providerRepository.findByVerificationToken(verificationToken);
                if (!provider) throw new Error("User not found.");

                provider.changePassword({ password: hashedPassword });
                await this.providerRepository.update(provider);

                await this.kafkaProducer.publish<SendEmailCommon>(kafkaConfig.topics.pub.passwordReset, {
                    email: provider.email,
                    name: provider.username
                });
            };

        } catch (error) {
            log.error("UpdatePasswordUseCase failed : ", error as Error);
            throw error;
        };
    };
};