import { log } from "../../../shared/logger/logger";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ApiResponse, FetchProviderProofsRequest, FetchProviderProofsResponse } from "../../dtos/common.dto";

export class FetchProviderProofsUseCase {
    constructor(
        private signedUrlService: ISignedUrlService,
        private providerRepository: IProviderRepository,
    ) { }

    async execute(payload: FetchProviderProofsRequest): Promise<ApiResponse<FetchProviderProofsResponse>> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("Failed to find provider");

            let signedIdentityProofUrl: string | null = null;
            let signedServiceProofUrl: string | null = null;

            if (provider.identityProof) {
                signedIdentityProofUrl = await this.signedUrlService.generate(provider.identityProof);
            };

            if (provider.serviceProof) {
                signedServiceProofUrl = await this.signedUrlService.generate(provider.serviceProof);
            };

            return {
                success: true,
                message: "Signed urls",
                data: {
                    identityProof: signedIdentityProofUrl,
                    serviceProof: signedServiceProofUrl,
                }
            };
        } catch (error) {
            log.error("FetchProviderProofsUseCase failed", error as Error);
            throw error;
        };
    };
};