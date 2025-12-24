import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { IUserQueries } from "../../application/queries/IUser.queries";
import { UserQueriesImpl } from "../../infrastructure/queries/userQueries.impl";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IAddressRepository } from "../../domain/interfaces/repositories/IAddress.repository";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { ISignedUrlCacheRepository } from "../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { AdminFetchUserOrProviderAddressUseCase } from "../../application/useCases/admin/adminAddress.useCase";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { changeBlockStatusZodSchema, RequestQueryCommonZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { AdminChangeUserBlockStatusUseCase, AdminFetchUserDetailsUseCase, AdminUserListUseCase } from "../../application/useCases/admin/adminUser.useCase";

const userRepository: IUserRepository = new UserRepositoryImpl();
const addressRepository: IAddressRepository = new AddressRepositoryImpl();
const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();

const signedUrlService = new SignedUrlService(signedUrlCacheRepository);

const userQueries: IUserQueries = new UserQueriesImpl();

const adminUserListUseCase = new AdminUserListUseCase(userQueries);
const adminChangeUserBlockStatusUseCase = new AdminChangeUserBlockStatusUseCase(userRepository);
const adminFetchUserDetailsUseCase = new AdminFetchUserDetailsUseCase(userRepository, signedUrlService);
const adminFetchUserOrProviderAddressUseCase = new AdminFetchUserOrProviderAddressUseCase(addressRepository);

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
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminUserListUseCase.execute({ page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("getAllUsers failed", error as Error);
            next(error);
        };
    };

    async changeUserBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus } = changeBlockStatusZodSchema.parse(req.body);
            const { id: userId } = ValidateObjectId(req.params.userId, "User ID");
            if (!userId || blockStatus === null) throw new Error("Invalid request");
            const result = await this.adminChangeUserBlockStatusUseCase.execute({ userId, isBlocked: blockStatus });
            sendResponse(res, result, `Successfully ${result.isBlocked ? "blocked" : "unblocked"} user`);
        } catch (error) {
            log.error("changeUserBlockStatus failed", error as Error);
            next(error);
        };
    };

    async fetchUserDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: userId } = ValidateObjectId(req.params.userId, "User ID");
            if (!userId) throw new Error("Invalid request.");
            const result = await this.adminFetchUserDetailsUseCase.execute({ userId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchUserDetails failed", error as Error);
            next(error);
        };
    };

    async fetchUserAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: userId } = ValidateObjectId(req.params.userId, "User ID");
            if (!userId) throw new Error("Invalid request.");
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

