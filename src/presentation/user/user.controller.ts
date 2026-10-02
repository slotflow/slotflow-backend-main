import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { AuthUser } from "../../application/dtos/common.dto";
import { profileSetupSchema } from "../../shared/zod/auth.zod";
import { sendResponse } from "../../shared/utils/helpers/response";
import { cookieOptions } from "../../shared/utils/constants/constant";
import { adminUserBlockStatusSchema } from "../../shared/zod/admin.zod";
import { GetUsersUseCase } from "../../application/useCases/user/getUsers.useCase";
import { paginationSchema, validateUserIdSchema } from "../../shared/zod/base.zod";
import { ProfileSetupUseCase } from "../../application/useCases/user/profileSetup.useCase";
import { UpdatePasswordUseCase } from "../../application/useCases/user/updatePassword.useCase";
import { GetUserProfileDetailsUseCase } from "../../application/useCases/user/getUserProfile.useCase";
import { GetUserForChatSidebarUseCase } from "../../application/useCases/user/getUserFroChat.useCase";
import { UpdateUserTimeZoneUseCase } from "../../application/useCases/user/updateUserTimeZone.useCase";
import { UpdateUserProfileInfoUseCase } from "../../application/useCases/user/updateUserProfileInfo.useCase";
import { ChangeUserBlockStatusUseCase } from "../../application/useCases/user/changeUserBlockStatus.useCase";
import { UpdateUserProfileImageUseCase } from "../../application/useCases/user/updateUserProfileImage.useCase";
import { timeZoneSchema, userUpdateFileSchema, userUpdateInfoSchema, userUpdatePasswordSchema } from "../../shared/zod/user.zod";
import { changeUserBlockStatusUseCase, getUserProfileDetailsUseCase, getUsersUseCase, getUserForChatSidebarUseCase, profileSetupUseCase, updateUserProfileImageUseCase, updateUserProfileInfoUseCase, updatePasswordUseCase, updateUserTimeZoneUseCase } from ".";

class UserController {
    constructor(
        private readonly updateUserProfileImageUseCase: UpdateUserProfileImageUseCase,
        private readonly updateUserProfileInfoUseCase: UpdateUserProfileInfoUseCase,
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly changeUserBlockStatusUseCase: ChangeUserBlockStatusUseCase,
        private readonly getUserProfileDetailsUseCase: GetUserProfileDetailsUseCase,
        private readonly getUserForChatSidebarUseCase: GetUserForChatSidebarUseCase,
        private readonly profileSetupUseCase: ProfileSetupUseCase,
        private readonly updatePasswordUseCase: UpdatePasswordUseCase,
        private readonly updateUserTimeZoneUseCase: UpdateUserTimeZoneUseCase
    ) {
        this.getProfileDetails = this.getProfileDetails.bind(this);
        this.updateProfileImage = this.updateProfileImage.bind(this);
        this.updateUserInfo = this.updateUserInfo.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.changeUserBlockStatus = this.changeUserBlockStatus.bind(this);
        this.profileSetup = this.profileSetup.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.updateTimezone = this.updateTimezone.bind(this);
    };

    async getProfileDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            if (user.role === Role.USER) {
                const result = await this.getUserProfileDetailsUseCase.execute({ userId: user.id, isAdmin: false });
                sendResponse(res, result);
            }
            if (user.role === Role.ADMIN) {
                const { userId } = validateUserIdSchema.parse({ userId: req.params.userId });
                const result = await this.getUserProfileDetailsUseCase.execute({ userId, isAdmin: true });
                sendResponse(res, result);
            }
        } catch (error) {
            log.error("getProfileDetails failed", error as Error);
            next(error);
        };
    };

    async updateProfileImage(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const { s3FileKey } = userUpdateFileSchema.parse(req.body);
            const result = await this.updateUserProfileImageUseCase.execute({ userId: user.id, profileImage: s3FileKey });
            sendResponse(res, result, "Profile image updated successfully");
        } catch (error) {
            log.error("updateProfileImage failed", error as Error);
            next(error);
        };
    };

    async updateUserInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const { phone, username } = userUpdateInfoSchema.parse({
                ...req.body
            });
            const result = await this.updateUserProfileInfoUseCase.execute({ userId: user.id, username, phone });
            sendResponse(res, result, "Info updated successfully");
        } catch (error) {
            log.error("updateUserInfo failed", error as Error);
            next(error);
        };
    };

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            if (user.role === Role.ADMIN) {
                const { page, limit } = paginationSchema.parse(req.query);
                const result = await this.getUsersUseCase.execute({ page, limit });
                sendResponse(res, result);
            } else {
                const result = await this.getUserForChatSidebarUseCase.execute({
                    userId: user.id,
                    role: user.role,
                    timeZone: user.timeZone.value
                });
                sendResponse(res, result);
            }
        } catch (error) {
            log.error("getUsers failed", error as Error);
            next(error);
        };
    };

    async changeUserBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { isBlocked, userId } = adminUserBlockStatusSchema.parse({
                userId: req.params.userId,
                isBlocked: req.body.isBlocked
            });
            const result = await this.changeUserBlockStatusUseCase.execute({
                userId,
                isBlocked
            });
            sendResponse(res, result, `Successfully ${result.isBlocked ? "blocked" : "unblocked"} user`);
        } catch (error) {
            log.error("changeUserBlockStatus failed", error as Error);
            next(error);
        };
    };

    async profileSetup(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const validatedData = profileSetupSchema.parse(req.body);
            const result = await this.profileSetupUseCase.execute({
                ...validatedData,
                _id: user.id,
            });
            res.cookie("token", result.token, cookieOptions);
            sendResponse(res, result, "Setup completed successfully");
        } catch (error) {
            log.error("profileSetupUseCase failed", error as Error);
            next(error);
        };
    };

    async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const validatedData = userUpdatePasswordSchema.parse(req.body);
            await this.updatePasswordUseCase.execute({
                ...validatedData,
                userId: user.id
            });
            sendResponse(res, null, "Password updated successfully");
        } catch (error) {
            log.error("updatePassword failed", error as Error);
            next(error);
        }
    }

    async updateTimezone(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const validatedData = timeZoneSchema.parse(req.body);
            const result = await this.updateUserTimeZoneUseCase.execute({
                timeZone: validatedData,
                userId: user.id
            });
            sendResponse(res, result, "Timezone updated");
        } catch (error) {
            next(error);
        }
    }

};

export const userController = new UserController(
    updateUserProfileImageUseCase,
    updateUserProfileInfoUseCase,
    getUsersUseCase,
    changeUserBlockStatusUseCase,
    getUserProfileDetailsUseCase,
    getUserForChatSidebarUseCase,
    profileSetupUseCase,
    updatePasswordUseCase,
    updateUserTimeZoneUseCase
);