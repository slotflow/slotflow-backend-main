import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { log } from "../../../shared/logger/logger";
import { GetUserProfileDetailsRequest, GetUserProfileDetailsResponse } from "../../dtos/user.dto";

export class GetUserProfileDetailsUseCase {
    constructor(
        private userRepository: IUserRepository,
        private signedUrlService: ISignedUrlService
    ) { };

    async execute(payload: GetUserProfileDetailsRequest): Promise<GetUserProfileDetailsResponse> {
        try {
            const { userId, isAdmin } = payload;

            const user = await this.userRepository.findById(userId);
            if (!user) return null;

            let signedProfileImage: string | null = null;
            if (isAdmin && user.profileImage) {
                signedProfileImage = await this.signedUrlService.get(user.profileImage);
            };


            return {
                email: user.email,
                isBlocked: user.isBlocked,
                isEmailVerified: user.isEmailVerified,
                phone: user.phone,
                username: user.username,
                profileImage: isAdmin ? signedProfileImage : undefined,
                createdAt: user.createdAt,
            };
        } catch (error) {
            log.error("GetUserProfileDetailsUseCase failed", error as Error);
            throw error;
        };
    };
};
