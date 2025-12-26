import { log } from "../../../shared/logger/logger";
import { CreateCredentialRequest } from "../../dtos/common.dto";
import { Credential } from "../../../domain/entities/credential.entity";
import { IAesEncryption } from "../../../domain/interfaces/services/IAesEncryption.service";
import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";

export class CreateCredentialUseCase {
    constructor(
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryption,
    ) { };

    async execute(payload: CreateCredentialRequest): Promise<void> {
        try {
            const { accessToken, expiryDate, refreshToken, userId } = payload;

            const encryptedAccessToken = await this.aesEncryption.encrypt(accessToken);
            const encryptedRefreshToken = await this.aesEncryption.encrypt(refreshToken);

            const credentials = Credential.create({
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiryDate,
                userId,
            });

            await this.credentialRepository.create(credentials);
        } catch (error) {
            log.error("CreateCredentialUseCase failed", error as Error);
            throw error;
        };
    };
};