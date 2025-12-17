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

            const provider = await this.providerRepository.findProviderById(providerId);
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