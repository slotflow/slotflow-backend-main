import { log } from "../../../shared/logger/logger";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { AdminGetProviderDetailsRequest, AdminGetProviderDetailsResponse } from "../../dtos/provider.dto";

export class AdminGetProviderDetailsUseCase {
    constructor(
        private signedUrlService: ISignedUrlService,
        private userRepository: IUserRepository,
        private providerProfileRepository: IProviderProfileRepository
    ) { };

    async execute(payload: AdminGetProviderDetailsRequest): Promise<AdminGetProviderDetailsResponse> {
        try {
            const { providerId } = payload;

            const provider = await this.userRepository.findById(providerId);
            if (!provider) return null;

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
            if (!providerProfile) return null;

            let signedProfileImageUrl: string | null = null;
            if (provider.profileImage) {
                signedProfileImageUrl = await this.signedUrlService.get(provider.profileImage);
            };

            return {
                _id: provider._id,
                username: provider.username,
                email: provider.email,
                phone: provider.phone,
                createdAt: provider.createdAt,
                profileImage: signedProfileImageUrl,
                isBlocked: provider.isBlocked,

                adminVerificationStatus: providerProfile.adminVerificationStatus,
                isAddressVerified: providerProfile.isAddressVerified,
                isAdminVerified: providerProfile.isAdminVerified,
                isAvailabilityVerified: providerProfile.isAvailabilityVerified,
                isProofsVerified: providerProfile.isProofsVerified,
                isServiceDetailsVerified: providerProfile.isServiceDetailsVerified,
                trustedBySlotflow: providerProfile.trustedBySlotflow,
            };

        } catch (error) {
            log.error("AdminGetProviderDetailsUseCase failed", error as Error);
            throw error;
        };
    };
};