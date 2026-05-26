import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { GetProviderProofsInput, GetProviderProofsOutput } from "../../dtos/user.dto";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class GetProviderProofsUseCase {
    constructor(
        private readonly signedUrlService: ISignedUrlService,
        private readonly providerProfileRepository: IProviderProfileRepository
    ) { };

    async execute(input: GetProviderProofsInput): Promise<GetProviderProofsOutput> {
        try {
            const { providerId } = input;
            if (!providerId) {
                throw new BadRequestError();
            }

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
            if (!providerProfile) {
                throw new NotFoundError(
                    "Provider profile not found",
                    ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
                );
            }

            let signedIdentityProofUrl: string | null = null;
            let signedServiceProofUrl: string | null = null;

            if (providerProfile.identityProof) {
                signedIdentityProofUrl = await this.signedUrlService.get(providerProfile.identityProof);
            };

            if (providerProfile.serviceProof) {
                signedServiceProofUrl = await this.signedUrlService.get(providerProfile.serviceProof);
            };

            return {
                identityProof: signedIdentityProofUrl,
                serviceProof: signedServiceProofUrl,
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get provider proofs");
        };
    };
};