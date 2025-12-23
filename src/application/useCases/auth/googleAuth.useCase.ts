import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/role.enum";
import { GoogleAuthRequest } from "../../dtos/auth.dto";
import { User } from "../../../domain/entities/user.entity";
import { Provider } from "../../../domain/entities/provider.entity";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class GoogleAuthUseCase {
    constructor(
        private userRepository: IUserRepository,
        private providerRepository: IProviderRepository,
    ) { }

    async execute(payload: GoogleAuthRequest): Promise<User | Provider> {
        try {
            const { email, googleId, image, name, role } = payload;

            if (role === Role.User) {
                let user = await this.userRepository.findByGoogleId(googleId);

                if (!user) {
                    user = await this.userRepository.findByEmail(email);
                }

                if (!user) {
                    user = User.createGoogle({
                        username: name,
                        email,
                        googleId,
                        isEmailVerified: true,
                        profileImage: image ?? "",
                    });
                    await this.userRepository.create(user);
                }

                return user;
            }

            if (role === Role.Provider) {
                let provider = await this.providerRepository.findByGoogleId(googleId);

                if (!provider) {
                    provider = await this.providerRepository.findByEmail(email);
                }

                if (!provider) {
                    provider = Provider.createGoogle({
                        username: name,
                        email,
                        googleId,
                        isEmailVerified: true,
                        profileImage: image ?? "",
                    });
                    await this.providerRepository.create(provider);
                }
                return provider;
            }

            throw new Error("Invalid role");
        } catch (error) {
            log.error("GoogleAuthUseCase failed", error as Error);
            throw error;
        }
    }
}