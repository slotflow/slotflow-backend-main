import { log } from "../../shared/logger/logger";
import { redis } from "../../infrastructure/lib/redis";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { s3Client } from "../../infrastructure/lib/aws_s3";
import { IUserQueries } from "../../application/queries/IUser.queries";
import { UserQueriesImpl } from "../../infrastructure/queries/userQueries.impl";
import { SignedUrlServiceImpl } from "../../infrastructure/services/signedUrlService.impl";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IAddressRepository } from "../../domain/interfaces/repositories/IAddress.repository";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { AdminFetchUserOrProviderAddressUseCase } from "../../application/useCases/admin/adminAddress.useCase";
import { changeBlockStatusZodSchema, RequestQueryCommonZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { AdminChangeUserBlockStatusUseCase, AdminFetchUserDetailsUseCase, AdminUserListUseCase } from "../../application/useCases/admin/adminUser.useCase";

const userRepository: IUserRepository = new UserRepositoryImpl();
const addressRepository: IAddressRepository = new AddressRepositoryImpl();

const userQueries: IUserQueries = new UserQueriesImpl();

const signedUrlService = new SignedUrlServiceImpl(redis, s3Client);

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

