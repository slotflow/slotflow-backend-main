import { Role } from "../../../domain/enums/role.enum";
import { User } from "../../../domain/entities/user.entity";
import { JWTService } from "../../../infrastructure/security/jwt";
import { Provider } from "../../../domain/entities/provider.entity";
import { Credential } from "../../../domain/entities/credential.entity";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IAesEncryptionService } from "../../../domain/interfaces/services/IAesEncryption.service";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { GoogleAuthOrchestrationRequest, GoogleAuthOrchestrationResponse } from "../../dtos/auth.dto";
import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";

export class GoogleAuthOrchestratorUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly providerRepository: IProviderRepository,
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryptionService,
    ) { };

    async execute(payload: GoogleAuthOrchestrationRequest): Promise<GoogleAuthOrchestrationResponse> {

        const { connectOnly, role, userId, email, googleId, name, image, accessToken, expiryDate, refreshToken } = payload;

        let entity;
        let token;

        if (!connectOnly) {
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

                entity = user;
            };

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
                entity = provider;
            }

            token = JWTService.generateToken({ email: email, role: role });

        } else {
            if (!userId || !role) throw new Error("Invalid connect flow");

            if (role === Role.User) {
                const provider = await this.providerRepository.findById(userId);
                if (!provider) throw new Error("Provider not found");
                provider.linkGoogleAccount({ googleId, googleConnected: true });
                entity = await this.providerRepository.update(provider);
            };

            if (role === Role.Provider) {
                const user = await this.userRepository.findById(userId);
                if (!user) throw new Error("User not found");
                user.linkGoogleAccount({ googleId, googleConnected: true });
                entity = await this.userRepository.update(user);
            };
        };

        const encryptedAccessToken = await this.aesEncryption.encrypt(accessToken);
        const encryptedRefreshToken = await this.aesEncryption.encrypt(refreshToken);

        const credentials = Credential.create({
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            expiryDate,
            userId: userId ?? (entity as User | Provider)._id,
        });

        await this.credentialRepository.create(credentials);

        return { token };
    };
};