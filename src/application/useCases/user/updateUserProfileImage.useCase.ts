import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { log } from "../../../shared/logger/logger";
import { UpdateUserProfileImageResponse, UpdateUserProfileImageRequest } from "../../dtos/user.dto";

export class UpdateUserProfileImageUseCase {
    constructor(
        private userRepository: IUserRepository,
        private signedUrlService: ISignedUrlService
    ) { };

    async execute(input: UpdateUserProfileImageRequest): Promise<UpdateUserProfileImageResponse> {
        try {
            const { userId, profileImage } = input;
            if (!userId || !profileImage) throw new Error("Invalid request");

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found");

            user.updateProfileImage({ profileImage });
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("Failed to save profile image");

            const signedUrl = await this.signedUrlService.save(profileImage);
            if (!signedUrl) throw new Error("Internal error");

            return signedUrl;
        } catch (error) {
            log.error("UpdateUserProfileImageUseCase failed", error as Error);
            throw error;
        };
    };
};