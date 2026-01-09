import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/role.enum";
import { UpdatePasswordRequest } from "../../dtos/auth.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { IPasswordHasher } from "../../../domain/interfaces/security/IPasswordHasher";

export class UpdatePasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerRepository: IProviderRepository,
        private passwordHasher: IPasswordHasher
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

            } else if (role === Role.Provider) {
                const provider = await this.providerRepository.findByVerificationToken(verificationToken);
                if (!provider) throw new Error("User not found.");

                provider.changePassword({ password: hashedPassword });
                await this.providerRepository.update(provider);
            };

            // TODO send email

        } catch (error) {
            log.error("UpdatePasswordUseCase failed : ", error as Error);
            throw error;
        };
    };
};