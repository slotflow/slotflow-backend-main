import { log } from "../../../shared/logger/logger";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { ApiResponse, GetProviderProofsRequest, GetProviderProofsResponse } from "../../dtos/common.dto";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class GetProviderProofsUseCase {
    constructor(
        private readonly  signedUrlService: ISignedUrlService,
        private readonly  providerProfileRepository: IProviderProfileRepository
    ) { };

    async execute(payload: GetProviderProofsRequest): Promise<ApiResponse<GetProviderProofsResponse>> {
        try {
            const { providerId } = payload;

            const provider = await this.providerProfileRepository.findById(providerId);
            if (!provider) throw new Error("Failed to find provider");

            let signedIdentityProofUrl: string | null = null;
            let signedServiceProofUrl: string | null = null;

            if (provider.identityProof) {
                signedIdentityProofUrl = await this.signedUrlService.get(provider.identityProof);
            };

            if (provider.serviceProof) {
                signedServiceProofUrl = await this.signedUrlService.get(provider.serviceProof);
            };

            return {
                success: true,
                message: "Signed urls",
                data: {
                    identityProof: signedIdentityProofUrl,
                    serviceProof: signedServiceProofUrl,
                },
            };
        } catch (error) {
            log.error("GetProviderProofsUseCase failed", error as Error);
            throw error;
        };
    };
};