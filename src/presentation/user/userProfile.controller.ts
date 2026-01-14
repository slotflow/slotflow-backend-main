import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { userUpdateFileSchema, userUpdateInfoSchema, validateUserIdSchema } from "../../shared/zod/user.zod";
import { userFetchProfileDetailsUseCase, userUpdateProfileImageUseCase, userUpdateProviderInfoUseCase } from ".";
import { UserFetchProfileDetailsUseCase, UserUpdateProfileImageUseCase, UserUpdateProviderInfoUseCase } from "../../application/useCases/user/userProfile.useCase";

class UserProfileController {
    constructor(
        private userFetchProfileDetailsUseCase: UserFetchProfileDetailsUseCase,
        private userUpdateProfileImageUseCase: UserUpdateProfileImageUseCase,
        private userUpdateProviderInfoUseCase: UserUpdateProviderInfoUseCase,
    ) {
        this.getProfileDetails = this.getProfileDetails.bind(this);
        this.updateProfileImage = this.updateProfileImage.bind(this);
        this.updateUserInfo = this.updateUserInfo.bind(this);
    };

    async getProfileDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = validateUserIdSchema.parse({ userId: (req.user as DecodedUser).userOrProviderId });
            const result = await this.userFetchProfileDetailsUseCase.execute({ userId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getProfileDetails failed", error as Error);
            next(error);
        };
    };

    async updateProfileImage(req: Request, res: Response, next: NextFunction) {
        try {
            const { s3FileKey, userId } = userUpdateFileSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                ...req.body,
            });
            const result = await this.userUpdateProfileImageUseCase.execute({ userId, profileImage: s3FileKey });
            sendResponse(res, result, "Profile image updated successfully");
        } catch (error) {
            log.error("updateProfileImage failed", error as Error);
            next(error);
        };
    };

    async updateUserInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const { phone, userId, username } = userUpdateInfoSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.userUpdateProviderInfoUseCase.execute({ userId, username, phone });
            sendResponse(res, result, "Info updated successfully");
        } catch (error) {
            log.error("updateUserInfo failed", error as Error);
            next(error);
        };
    };

};

export const userProfileController = new UserProfileController(
    userFetchProfileDetailsUseCase,
    userUpdateProfileImageUseCase,
    userUpdateProviderInfoUseCase,
);