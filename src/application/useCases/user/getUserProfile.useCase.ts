import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { GetUserProfileDetailsInput, GetUserProfileDetailsOutput } from "../../dtos/user.dto";

export class GetUserProfileDetailsUseCase {
    constructor(
        private userRepository: IUserRepository,
        private signedUrlService: ISignedUrlService
    ) { };

    async execute(input: GetUserProfileDetailsInput): Promise<GetUserProfileDetailsOutput> {
        try {
            const { userId, isAdmin } = input;
            if (!userId) {
                throw new BadRequestError();
            }

            const user = await this.userRepository.findById(userId);
            if (!user) return null;

            let signedProfileImage: string | null = null;
            if (isAdmin && user.profileImage) {
                signedProfileImage = await this.signedUrlService.get(user.profileImage);
            };

            return {
                email: user.email,
                isBlocked: user.isBlocked,
                phone: user.phone,
                username: user.username,
                profileImage: isAdmin ? signedProfileImage : undefined,
                createdAt: user.createdAt,
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get user profile");
        };
    };
};
