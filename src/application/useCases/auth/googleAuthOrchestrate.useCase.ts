import { log } from "../../../shared/logger/logger";
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
        try {

            const { connectOnly, role, userId, email, googleId, name, image, accessToken, expiryDate, refreshToken } = payload;
            console.log("connectOnly, role, userId, email, googleId, name, image, accessToken, expiryDate, refreshToken", connectOnly, role, userId, email, googleId, name, image, accessToken, expiryDate, refreshToken)

            let entity;
            let token;

            if (!connectOnly) {
                console.log("ConnectOnly false : ",connectOnly)
                if (role === Role.User) {
                    let user = await this.userRepository.findByGoogleId(googleId);

                    if (!user) {
                        user = await this.userRepository.findByEmail(email);
                    }

                    if (!user) {
                        const userData = User.createGoogle({
                            username: name,
                            email,
                            googleId,
                            isEmailVerified: true,
                            profileImage: image ?? "",
                        });
                        user = await this.userRepository.create(userData);
                    }

                    entity = { ...user.getProps() };
                };

                if (role === Role.Provider) {
                    let provider = await this.providerRepository.findByGoogleId(googleId);

                    if (!provider) {
                        provider = await this.providerRepository.findByEmail(email);
                    }

                    if (!provider) {
                        const providerData = Provider.createGoogle({
                            username: name,
                            email,
                            googleId,
                            isEmailVerified: true,
                            profileImage: image ?? "",
                        });
                        provider = await this.providerRepository.create(providerData);
                    }
                    entity = { ...provider.getProps() };
                }

                token = JWTService.generateToken({ email: email, userOrProviderId: entity?._id, role: role });

            } else {
                console.log("connectOnly true : ",connectOnly);
                if (!userId || !role) throw new Error("Invalid connect flow");

                if (role === Role.User) {
                    const user = await this.providerRepository.findById(userId);
                    if (!user) throw new Error("User not found");
                    user.linkGoogleAccount({ googleId, googleConnected: true });
                    await this.providerRepository.update(user);
                };

                if (role === Role.Provider) {
                    const provider = await this.userRepository.findById(userId);
                    if (!provider) throw new Error("User not found");
                    provider.linkGoogleAccount({ googleId, googleConnected: true });
                    await this.userRepository.update(provider);
                };
            };

            const encryptedAccessToken = await this.aesEncryption.encrypt(accessToken);
            const encryptedRefreshToken = await this.aesEncryption.encrypt(refreshToken);

            console.log("entity : ", entity);
            console.log("userId: ", userId);

            const credentials = Credential.create({
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiryDate,
                userId: userId ?? (entity as User | Provider)._id,
            });

            console.log("credentials : ",credentials);

            await this.credentialRepository.create(credentials);

            return { token, user: { _id: credentials.userId } };
        } catch (error) {
            log.error("GoogleAuthOrchestratorUseCase failed : ", error as Error);
            throw error;
        };
    };
};