import { Types } from "mongoose";
import { Credential } from "../../domain/entities/credential";
import { AesEncryption } from "../../infrastructure/services/aesEncryption";
import { ApiResponse, CreateCredential } from "../../infrastructure/dtos/common.dto";
import { CredentialRepositoryImpl } from "../../infrastructure/database/credential/credential.repository.impl";

export class CreateCredentialUseCase {
    constructor(
        private credentialRepositoryImpl: CredentialRepositoryImpl,
        private aesEncryption: AesEncryption,
    ) { }

    async execute(payload: CreateCredential): Promise<ApiResponse> {
        try {
            const { accessToken, expiryDate, refreshToken, userId } = payload;

            const encryptedAccessToken = await this.aesEncryption.encrypt(accessToken);
            const encryptedRefreshToken = await this.aesEncryption.encrypt(refreshToken);

            const result = await this.credentialRepositoryImpl.createCredential({
                userId,
                expiryDate,
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken
            });
            if (!result) throw new Error("Unexpected error in token saving");

            return { success: true, message: "Credentials saved" };
        } catch (error) {
            console.log("create credentials error : ",error);
            throw new Error("Credential saving failed");
        }
    }
}


export class GetCredentialUseCase {
    constructor(
        private credentialRepositoryImpl: CredentialRepositoryImpl,
        private aesEncryption: AesEncryption,
    ) { }

    async execute(userId: Types.ObjectId): Promise<Credential> {
        try {
            if (!userId) throw new Error("Invalid request");

            const credentials = await this.credentialRepositoryImpl.getCredentialByUserId(userId);
            if (!credentials) throw new Error("Credential fetching failed");

            const decryptedAccessToken = await this.aesEncryption.decrypt(credentials.accessToken);
            const decryptedRefreshToken = await this.aesEncryption.decrypt(credentials.refreshToken);

            return {
                ...credentials,
                accessToken: decryptedAccessToken,
                refreshToken: decryptedRefreshToken
            }
        } catch (error) {
            console.log("Fetching credentials error : ",error);
            throw new Error("Fetching credentials failed");
        }
    }
}


export class UpdateCredentialUseCase {
    constructor(
        private credentialRepositoryImpl: CredentialRepositoryImpl,
        private aesEncryption: AesEncryption
    ) { }

    async execute(payload: Credential): Promise<ApiResponse> {
        try {
            const { _id, accessToken, createdAt, updatedAt, expiryDate, refreshToken, userId } = payload;
            if (!_id || !accessToken || !refreshToken || !createdAt || !updatedAt || !expiryDate || !userId) throw new Error("Creatial updation failed");

            const decryptedAccessToken = await this.aesEncryption.decrypt(accessToken);
            const decryptedRefreshToken = await this.aesEncryption.decrypt(refreshToken);

            const updatedCredentials = await this.credentialRepositoryImpl.updateCredential({
                ...payload,
                accessToken: decryptedAccessToken,
                refreshToken: decryptedRefreshToken,
            });
            if(!updatedCredentials) throw new Error('Credentials updation failed');

            return { success: true, message: "Credentials updated" };
        } catch (error) {
            console.log("Credentials updation failed");
            throw new Error("Credentials updating failed");
        }
    }
}