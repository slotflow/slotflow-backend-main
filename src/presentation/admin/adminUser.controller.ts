import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { validateUserIdSchema } from "../../shared/zod/user.zod";
import { paginationSchema } from "../../shared/zod/common.zod";
import { adminUserBlockStatusSchema } from "../../shared/zod/admin.zod";
import { AdminFetchUserOrProviderAddressUseCase } from "../../application/useCases/admin/adminAddress.useCase";
import { adminChangeUserBlockStatusUseCase, adminFetchUserDetailsUseCase, adminFetchUserOrProviderAddressUseCase, adminUserListUseCase } from ".";
import { AdminChangeUserBlockStatusUseCase, AdminFetchUserDetailsUseCase, AdminUserListUseCase } from "../../application/useCases/admin/adminUser.useCase";

class AdminUserController {
    constructor(
        private adminUserListUseCase: AdminUserListUseCase,
        private adminChangeUserBlockStatusUseCase: AdminChangeUserBlockStatusUseCase,
        private adminFetchUserDetailsUseCase: AdminFetchUserDetailsUseCase,
        private adminFetchUserOrProviderAddressUseCase: AdminFetchUserOrProviderAddressUseCase
    ) {
        this.getAllUsers = this.getAllUsers.bind(this);
        this.changeUserBlockStatus = this.changeUserBlockStatus.bind(this);
        this.fetchUserDetails = this.fetchUserDetails.bind(this);
        this.fetchUserAddress = this.fetchUserAddress.bind(this);
    };

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = paginationSchema.parse(req.query);
            const result = await this.adminUserListUseCase.execute({ page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("getAllUsers failed", error as Error);
            next(error);
        };
    };

    async changeUserBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus, userId } = adminUserBlockStatusSchema.parse({
                userId: req.params.userId,
                blockStatus: req.body.blockStatus
            });
            const result = await this.adminChangeUserBlockStatusUseCase.execute({ 
                userId, 
                isBlocked: blockStatus 
            });
            sendResponse(res, result, `Successfully ${result.isBlocked ? "blocked" : "unblocked"} user`);
        } catch (error) {
            log.error("changeUserBlockStatus failed", error as Error);
            next(error);
        };
    };

    async fetchUserDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = validateUserIdSchema.parse({ userId: req.params.userId });
            const result = await this.adminFetchUserDetailsUseCase.execute({ userId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchUserDetails failed", error as Error);
            next(error);
        };
    };

    async fetchUserAddress(req: Request, res: Response, next: NextFunction) {
        try {
             const { userId } = validateUserIdSchema.parse({ userId: req.params.userId });
            const result = await this.adminFetchUserOrProviderAddressUseCase.execute({ userId });
            sendResponse(res, result, `${result ? "fetched successfully" : "not added yet"}`)
        } catch (error) {
            log.error("fetchUserAddress failed", error as Error);
            next(error);
        };
    };

};

export const adminUserController = new AdminUserController(
    adminUserListUseCase,
    adminChangeUserBlockStatusUseCase,
    adminFetchUserDetailsUseCase,
    adminFetchUserOrProviderAddressUseCase
);

