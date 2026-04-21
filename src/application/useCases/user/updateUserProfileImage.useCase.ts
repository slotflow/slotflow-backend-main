import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { UpdateUserProfileImageOutput, UpdateUserProfileImageInput } from "../../dtos/user.dto";

export class UpdateUserProfileImageUseCase {
    constructor(
        private userRepository: IUserRepository,
        private signedUrlService: ISignedUrlService
    ) { };

    async execute(input: UpdateUserProfileImageInput): Promise<UpdateUserProfileImageOutput> {
        try {
            const { userId, profileImage } = input;
            if (!userId || !profileImage) {
                throw new BadRequestError();
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            user.updateProfileImage({ profileImage });
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) {
                throw new AppError(
                    "Failed to save profile image",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            const signedUrl = await this.signedUrlService.save(profileImage);

            return signedUrl;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to update profile image");
        };
    };
};