import { Types } from "mongoose";
import { Credential } from "../../../domain/entities/credential.entity";
import { IAesEncryption } from "../../../domain/interfaces/services/IAesEncryption.service";
import { ApiResponse, CreateCredentialRequest } from "../../dtos/common.dto";
import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";
import { IGoogleAuthTokenService } from "../../../domain/interfaces/services/IGoogleAuthToken.service";

export class CreateCredentialUseCase {
    constructor(
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryption,
    ) { }

    async execute(payload: CreateCredentialRequest): Promise<ApiResponse> {
        try {
            const { accessToken, expiryDate, refreshToken, userId } = payload;

            const encryptedAccessToken = await this.aesEncryption.encrypt(accessToken);
            const encryptedRefreshToken = await this.aesEncryption.encrypt(refreshToken);

            const result = await this.credentialRepository.createCredential({
                userId,
                expiryDate,
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken
            });
            if (!result) throw new Error("Unexpected error in token saving");

            return { success: true, message: "Credentials saved" };
        } catch (error) {
            console.log("CreateCredentialUseCase error : ", error);
            throw new Error("Failed to create credentials");
        }
    }
}


export class GetCredentialUseCase {
    constructor(
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryption,
        private googleAuthTokenService: IGoogleAuthTokenService
    ) { }

    async execute(userId: Types.ObjectId): Promise<Credential> {
        try {
            console.log("GetCredentialUseCase usecase start");

            const credential = await this.credentialRepository.findCredentialByUserId(userId);
            if (!credential) throw new Error("Credential fetching failed");

            const now = new Date();

            console.log("accessToken decryption start");
            const decryptedAccessToken = await this.aesEncryption.decrypt(credential.accessToken);
            console.log("accessToken decryption end");
            console.log("refreshToken decryption start");
            const decryptedRefreshToken = await this.aesEncryption.decrypt(credential.refreshToken);
            console.log("refreshToken decryption end");

            if (now < credential.expiryDate) {
                return {
                    ...credential,
                    accessToken: decryptedAccessToken,
                    refreshToken: decryptedRefreshToken
                }
            } else {
                const newToken = await this.googleAuthTokenService.refreshAccessToken(decryptedRefreshToken);

                const encryptedAccessToken = await this.aesEncryption.encrypt(newToken.accessToken);
                const encryptedRefreshToken = await this.aesEncryption.encrypt(newToken.refreshToken);

                const expiryDate =  new Date(Date.now() + 60 * 60 * 1000)

                const updatedCredential = await this.credentialRepository.updateCredential({
                    _id: credential._id,
                    accessToken: encryptedAccessToken,
                    refreshToken: encryptedRefreshToken,
                    expiryDate,
                });
                if (!updatedCredential) throw new Error("Failed to update credential");

                console.log("GetCredentialUseCase usecase end");
                return {
                    ...updatedCredential,
                    accessToken: newToken.accessToken,
                    refreshToken: newToken.refreshToken,
                    expiryDate,
                }
            }

        } catch (error) {
            console.log("GetCredentialUseCase error : ", error);
            throw new Error("Failed to get credentials");
        }
    }
}


export class UpdateCredentialUseCase {
    constructor(
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryption
    ) { }

    async execute(payload: Credential): Promise<ApiResponse> {
        try {
            console.log("UpdateCredentialUseCase usecase start");
            const { _id, accessToken, createdAt, updatedAt, expiryDate, refreshToken, userId } = payload;
            if (!_id || !accessToken || !refreshToken || !createdAt || !updatedAt || !expiryDate || !userId) throw new Error("Creatial updation failed");

            console.log("accessToken decryption start");
            const decryptedAccessToken = await this.aesEncryption.encrypt(accessToken);
            console.log("accessToken decryption end");
            console.log("refreshToken decryption start");
            const decryptedRefreshToken = await this.aesEncryption.encrypt(refreshToken);
            console.log("refreshToken decryption end");

            const updatedCredentials = await this.credentialRepository.updateCredential({
                ...payload,
                accessToken: decryptedAccessToken,
                refreshToken: decryptedRefreshToken,
            });
            if (!updatedCredentials) throw new Error('Credentials updation failed');

            console.log("UpdateCredentialUseCase usecase end");
            return { success: true, message: "Credentials updated" };
        } catch (error) {
            console.log("UpdateCredentialUseCase error : ", error);
            throw new Error("Failed to update credentials");
        }
    }
}