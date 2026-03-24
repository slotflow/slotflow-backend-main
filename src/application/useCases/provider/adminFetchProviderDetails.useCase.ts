import { log } from "../../../shared/logger/logger";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { AdminFetchProviderDetailsRequest, AdminFetchProviderDetailsResponse } from "../../dtos/admin.dto";

export class AdminFetchProviderDetailsUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private signedUrlService: ISignedUrlService
    ) { };

    async execute(payload: AdminFetchProviderDetailsRequest): Promise<AdminFetchProviderDetailsResponse> {
        try {
            const { providerId } = payload;

            const providerData = await this.providerRepository.findById(providerId);
            if (!providerData) return null;

            let signedProfileImageUrl: string | null = null;
            if (providerData.profileImage) {
                signedProfileImageUrl = await this.signedUrlService.get(providerData.profileImage);
            };

            return {
                _id: providerData._id,
                adminVerificationStatus: providerData.adminVerificationStatus,
                createdAt: providerData.createdAt,
                email: providerData.email,
                isAddressVerified: providerData.isAddressVerified,
                isAdminVerified: providerData.isAdminVerified,
                isAvailabilityVerified: providerData.isAvailabilityVerified,
                isBlocked: providerData.isBlocked,
                isEmailVerified: providerData.isEmailVerified,
                isProofsVerified: providerData.isProofsVerified,
                isServiceDetailsVerified: providerData.isServiceDetailsVerified,
                phone: providerData.phone,
                trustedBySlotflow: providerData.trustedBySlotflow,
                username: providerData.username,
                profileImage: signedProfileImageUrl,
            };

        } catch (error) {
            log.error("AdminFetchProviderDetailsUseCase failed", error as Error);
            throw error;
        };
    };
};