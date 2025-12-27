import { log } from "../../shared/logger/logger";
import { IAesEncryption } from "../../domain/interfaces/services/IAesEncryption.service";
import { IGoogleTokenService } from "../../domain/interfaces/services/IGoogleToken.service";
import { ICredentialRepository } from "../../domain/interfaces/repositories/ICredentialRepository";
import { IGoogleRefreshTokenService } from "../../domain/interfaces/services/IGoogleRefreshToken.service";

export class GoogleTokenService implements IGoogleTokenService {
    constructor(
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryption,
        private IgoogleRefreshTokenService: IGoogleRefreshTokenService
    ) { };

    async getAccessToken(userId: string): Promise<string> {
        try {
            console.log("GoogleTokenService service start");
            console.log("Before credentials")
            const credentials = await this.credentialRepository.findByUserId(userId);
            console.log("after credentials ");

            if (!credentials) throw new Error("Credentials fetchinga failed");
            const now = new Date();

            if (
                credentials.accessToken &&
                credentials.expiryDate &&
                credentials.expiryDate > now
            ) {
                return await this.aesEncryption.decrypt(
                    credentials.accessToken
                );
            }

            if (!credentials.refreshToken) {
                throw new Error("Refresh token missing");
            }


            const decryptedRefreshToken =
                await this.aesEncryption.decrypt(
                    credentials.refreshToken
                );

            const refreshed =
                await this.IgoogleRefreshTokenService.refreshAccessToken(
                    decryptedRefreshToken
                );

            const encryptedAccessToken =
                await this.aesEncryption.encrypt(
                    refreshed.accessToken
                );

            const encryptedRefreshToken = refreshed.refreshToken
                ? await this.aesEncryption.encrypt(refreshed.refreshToken)
                : credentials.refreshToken;

            credentials.updateCredential({
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiryDate: new Date(Date.now() + refreshed.expiresIn * 1000
                ),
            });

            await this.credentialRepository.update(credentials);
            await this.credentialRepository.update(credentials);

            return refreshed.accessToken;
        } catch (error) {
            log.error("GoogleTokenService failed", error as Error);
            throw error;
        };
    };
};
