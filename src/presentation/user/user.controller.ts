import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { adminUserBlockStatusSchema } from "../../shared/zod/admin.zod";
import { SetRoleUseCase } from "../../application/useCases/user/setRole.useCase";
import { GetUsersUseCase } from "../../application/useCases/user/getUsers.useCase";
import { paginationSchema, roleValidationSchema } from "../../shared/zod/base.zod";
import { GetUserProfileDetailsUseCase } from "../../application/useCases/user/getUserProfile.useCase";
import { UpdateUserProfileInfoUseCase } from "../../application/useCases/user/updateUserProfileInfo.useCase";
import { ChangeUserBlockStatusUseCase } from "../../application/useCases/user/changeUserBlockStatus.useCase";
import { ChangePushNotificationUseCase } from "../../application/useCases/user/changePushNotification.useCase";
import { UpdateUserProfileImageUseCase } from "../../application/useCases/user/updateUserProfileImage.useCase";
import { GetUserForChatSidebarUseCase } from "../../application/useCases/user/getUserFroChat.useCase";
import { userUpdateFileSchema, userUpdateInfoSchema, userUpdatePushNotificationSchema, validateUserIdSchema } from "../../shared/zod/user.zod";
import { changePushNotificationUseCase, changeUserBlockStatusUseCase, getUserProfileDetailsUseCase, getUsersUseCase, getUserForChatSidebarUseCase, setRoleUseCase, updateUserProfileImageUseCase, updateUserProfileInfoUseCase } from ".";

class UserController {
    constructor(
        private readonly updateUserProfileImageUseCase: UpdateUserProfileImageUseCase,
        private readonly updateUserProfileInfoUseCase: UpdateUserProfileInfoUseCase,
        private readonly changePushNotificationUseCase: ChangePushNotificationUseCase,
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly changeUserBlockStatusUseCase: ChangeUserBlockStatusUseCase,
        private readonly getUserProfileDetailsUseCase: GetUserProfileDetailsUseCase,
        private readonly getUserForChatSidebarUseCase: GetUserForChatSidebarUseCase,
        private readonly setRoleUseCase: SetRoleUseCase
    ) {
        this.getProfileDetails = this.getProfileDetails.bind(this);
        this.updateProfileImage = this.updateProfileImage.bind(this);
        this.updateUserInfo = this.updateUserInfo.bind(this);
        this.updatePushNotification = this.updatePushNotification.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.changeUserBlockStatus = this.changeUserBlockStatus.bind(this);
        this.setRole = this.setRole.bind(this);
    };

    async getProfileDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;

            if (user.role === Role.USER) {
                const result = await this.getUserProfileDetailsUseCase.execute({ userId: user.userOrProviderId, isAdmin: false });
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
            const { s3FileKey, userId } = userUpdateFileSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                ...req.body,
            });
            const result = await this.updateUserProfileImageUseCase.execute({ userId, profileImage: s3FileKey });
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
            const result = await this.updateUserProfileInfoUseCase.execute({ userId, username, phone });
            sendResponse(res, result, "Info updated successfully");
        } catch (error) {
            log.error("updateUserInfo failed", error as Error);
            next(error);
        };
    };

    async updatePushNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { allowPushNotification, userId } = userUpdatePushNotificationSchema.parse({
                userId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.changePushNotificationUseCase.execute({ userId, allowPushNotification });
            sendResponse(res, result, "Push notification updated successfully");
        } catch (error) {
            log.error("updatePushNotification failed", error as Error);
            next(error);
        };
    };

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;

            if (user.role === Role.ADMIN) {
                const { page, limit } = paginationSchema.parse(req.query);
                const result = await this.getUsersUseCase.execute({ page, limit });
                sendResponse(res, result);
            } else {
                const result = await this.getUserForChatSidebarUseCase.execute({ userId: user.userOrProviderId, role: user.role });
                sendResponse(res, result);
            }
        } catch (error) {
            log.error("getUsers failed", error as Error);
            next(error);
        };
    };

    async changeUserBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus, userId } = adminUserBlockStatusSchema.parse({
                userId: req.params.userId,
                blockStatus: req.body.blockStatus
            });
            const result = await this.changeUserBlockStatusUseCase.execute({
                userId,
                isBlocked: blockStatus
            });
            sendResponse(res, result, `Successfully ${result.isBlocked ? "blocked" : "unblocked"} user`);
        } catch (error) {
            log.error("changeUserBlockStatus failed", error as Error);
            next(error);
        };
    };

    async setRole(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("setRole");
            const user = req.user as DecodedUser;
            const { role } = roleValidationSchema.parse(req.body);
            const result = await this.setRoleUseCase.execute({ _id: user.userOrProviderId, role });
            sendResponse(res, result, "Role set successfully");
        } catch (error) {
            log.error("setRole failed", error as Error);
            next(error);
        };
    };

};

export const userController = new UserController(
    updateUserProfileImageUseCase,
    updateUserProfileInfoUseCase,
    changePushNotificationUseCase,
    getUsersUseCase,
    changeUserBlockStatusUseCase,
    getUserProfileDetailsUseCase,
    getUserForChatSidebarUseCase,
    setRoleUseCase
);