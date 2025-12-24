import { log } from "../../../shared/logger/logger";
import { Credential } from "../../../domain/entities/credential.entity";
import { IAesEncryption } from "../../../domain/interfaces/services/IAesEncryption.service";
import { ICredentialRepository } from "../../../domain/interfaces/repositories/ICredentialRepository";
import { IGoogleAuthTokenService } from "../../../domain/interfaces/services/IGoogleAuthToken.service";
import { CreateCredentialRequest, FetchCredentialsResponse, UpdateCredentialRequest } from "../../dtos/common.dto";

export class CreateCredentialUseCase {
    constructor(
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryption,
    ) { }

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
        }
    }
}


export class GetCredentialUseCase {
    constructor(
        private credentialRepository: ICredentialRepository,
        private aesEncryption: IAesEncryption,
        private googleAuthTokenService: IGoogleAuthTokenService
    ) { }

    async execute({userId}: {userId: string}): Promise<FetchCredentialsResponse> {
        try {
            console.log("GetCredentialUseCase usecase start");

            const credential = await this.credentialRepository.findByUserId(userId);
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
                    accessToken: decryptedAccessToken,
                    refreshToken: decryptedRefreshToken,
                    expiryDate: credential.expiryDate,
                    userId: credential.userId,
                };
            } else {
                const newToken = await this.googleAuthTokenService.refreshAccessToken(decryptedRefreshToken);

                const encryptedAccessToken = await this.aesEncryption.encrypt(newToken.accessToken);
                const encryptedRefreshToken = await this.aesEncryption.encrypt(newToken.refreshToken);

                credential.updateCredential({
                    accessToken: encryptedAccessToken,
                    refreshToken: encryptedRefreshToken,
                });

                const updatedCredential = await this.credentialRepository.update(credential);
                if (!updatedCredential) throw new Error("Failed to update credential");

                console.log("GetCredentialUseCase usecase end");
                return {
                    accessToken: newToken.accessToken,
                    refreshToken: newToken.refreshToken,
                    expiryDate: updatedCredential.expiryDate,
                    userId,
                };
            };

        } catch (error) {
            log.error("GetCredentialUseCase failed", error as Error);
            throw error;
        };
    };
};

// TODO REMOVE
// export class UpdateCredentialUseCase {
//     constructor(
//         private credentialRepository: ICredentialRepository,
//         private aesEncryption: IAesEncryption
//     ) { }

//     async execute(payload: UpdateCredentialRequest): Promise<void> {
//         try {
//             console.log("UpdateCredentialUseCase usecase start");
//             const { _id, accessToken, expiryDate, refreshToken } = payload;
//             if (!_id || !accessToken || !refreshToken || !expiryDate) throw new Error("Creatial updation failed");

//             console.log("accessToken decryption start");
//             const decryptedAccessToken = await this.aesEncryption.encrypt(accessToken);
//             console.log("accessToken decryption end");
//             console.log("refreshToken decryption start");
//             const decryptedRefreshToken = await this.aesEncryption.encrypt(refreshToken);
//             console.log("refreshToken decryption end");

//             const credential = await this.credentialRepository.findById(_id);
//             if (!credential) throw new Error("Credential updation failed");

//             credential.updateCredential({
//                 accessToken: decryptedAccessToken,
//                 refreshToken: decryptedRefreshToken,
//             });
                
//             const updatedCredentials = await this.credentialRepository.update(credential);
//             if (!updatedCredentials) throw new Error('Credentials updation failed');

//             console.log("UpdateCredentialUseCase usecase end");

//         } catch (error) {
//             console.log("UpdateCredentialUseCase error : ", error);
//             throw new Error("Failed to update credentials");
//         }
//     }
// }