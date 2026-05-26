import { log } from "../../shared/logger/logger";
import { ERROR_CODES } from "../../shared/utils/types";
import { AppError, NotFoundError, UnauthorizedError } from "../../shared/error/appError";
import { IGoogleTokenService } from "../../domain/interfaces/services/IGoogleToken.service";
import { IAesEncryptionService } from "../../domain/interfaces/services/IAesEncryption.service";
import { ICredentialRepository } from "../../domain/interfaces/repositories/ICredentialRepository";
import { IGoogleRefreshTokenService } from "../../domain/interfaces/services/IGoogleRefreshToken.service";

export class GoogleTokenServiceImpl implements IGoogleTokenService {
    constructor(
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryptionService,
        private IgoogleRefreshTokenService: IGoogleRefreshTokenService
    ) { };

    async getAccessToken(userId: string): Promise<string> {
        try {

            if (!userId) {
                throw new UnauthorizedError(
                    "User ID is required",
                    ERROR_CODES.UNAUTHORIZED
                );
            }

            const credentials = await this.credentialRepository.findByUserId(userId);

            if (!credentials) {
                throw new NotFoundError(
                    "Google credentials not found",
                    ERROR_CODES.CREDENTIAL_NOT_FOUND
                );
            }
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
                throw new UnauthorizedError(
                    "Refresh token missing",
                    ERROR_CODES.TOKEN_MISSING
                );
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

            return refreshed.accessToken;
        } catch (error) {
            log.error("GoogleTokenService failed", error as Error);
            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError(
                "Unable to get access token",
                500,
                false,
                ERROR_CODES.INTERNAL_ERROR
            );
        }
    };
};

