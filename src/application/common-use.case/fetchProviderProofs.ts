import { SignedUrlService } from "../../infrastructure/services/signedUrlService";
import { ApiResponse, FetchProviderProofsRequest, FetchProviderProofsResponse } from "../../infrastructure/dtos/common.dto";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";

export class FetchProviderProofsUseCase {
    constructor(
        private signedUrlService: SignedUrlService,
        private providerRepositoryImpl: ProviderRepositoryImpl,
    ) { }

    async execute(payload: FetchProviderProofsRequest): Promise<ApiResponse<FetchProviderProofsResponse>> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if(!provider) throw new Error("Failed to find provider");

            if(provider.identityProof) {
                provider.identityProof = await this.signedUrlService.generate(provider.identityProof);
            }

            if(provider.serviceProof) {
                provider.serviceProof = await this.signedUrlService.generate(provider.serviceProof);
            }

            return { 
                success: true, 
                message: "Signed urls", 
                data : {
                    identityProof: provider.identityProof,
                    serviceProof: provider.serviceProof,
                }
            };
        } catch (error) {
            console.log("FetchProviderProofsUseCase error : ",error);
            throw new Error(" Failed to fetch provider proofs");
        }
    }
}