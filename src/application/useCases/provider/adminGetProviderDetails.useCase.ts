import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { AdminGetProviderDetailsInput, AdminGetProviderDetailsOutput } from "../../dtos/user.dto";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class AdminGetProviderDetailsUseCase {
    constructor(
        private signedUrlService: ISignedUrlService,
        private userRepository: IUserRepository,
        private providerProfileRepository: IProviderProfileRepository
    ) { };

    async execute(input: AdminGetProviderDetailsInput): Promise<AdminGetProviderDetailsOutput> {
        try {
            const { providerId } = input;
            if (!providerId) {
                throw new BadRequestError();
            }

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

        } catch (error: unknown) {
            throw toAppError(error, "Failed to get provider details");
        };
    };
};