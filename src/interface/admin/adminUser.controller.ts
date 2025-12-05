import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { AdminChangeUserBlockStatusZOdSchema } from "../../shared/zod/admin.zod";
import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { RequestQueryCommonZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { AdminFetchUserOrProviderAddressUseCase } from "../../application/admin-use.case/adminAddress.use-case";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { AdminChangeUserBlockStatusUseCase, AdminFetchUserDetailsUseCase, AdminUserListUseCase } from "../../application/admin-use.case/adminUser.use-case";

const userRepositoryImpl = new UserRepositoryImpl();
const addressRepositoryImpl = new AddressRepositoryImpl();
const signedUrlCacheRepositoryImpl = new SignedUrlCacheRepositoryImpl();
const generateSignedUrlService = new GenerateSignedUrlService(signedUrlCacheRepositoryImpl);

const adminUserListUseCase = new AdminUserListUseCase(userRepositoryImpl);
const adminChangeUserBlockStatusUseCase = new AdminChangeUserBlockStatusUseCase(userRepositoryImpl);
const adminFetchUserOrProviderAddressUseCase = new AdminFetchUserOrProviderAddressUseCase(addressRepositoryImpl);
const adminFetchUserDetailsUseCase = new AdminFetchUserDetailsUseCase(userRepositoryImpl, generateSignedUrlService);

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
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminUserListUseCase.execute({ page, limit });
            res.status(200).json(result);
        } catch (error) {
            console.log("getAllUsers error : ",error);
            next(error)
        }
    }

    async changeUserBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus } = AdminChangeUserBlockStatusZOdSchema.parse(req.body);
            const { id: userId } = ValidateObjectId(req.params.userId, "User ID");
            if (!userId || blockStatus === null) throw new Error("Invalid request");
            const result = await this.adminChangeUserBlockStatusUseCase.execute({ userId: new Types.ObjectId(userId), isBlocked: blockStatus });
            res.status(200).json(result);
        } catch (error) {
            console.log("changeUserBlockStatus error : ",error);
            next(error)
        }
    }

    async fetchUserDetails(req: Request, res: Response, next: NextFunction) {
         try{
            const { id: userId } = ValidateObjectId(req.params.userId, "User ID");
            if(!userId) throw new Error("Invalid request.");
            const result = await this.adminFetchUserDetailsUseCase.execute({userId: new Types.ObjectId(userId)});
            res.status(200).json(result);
        }catch(error){
            console.log("fetchUserDetails error : ",error);
            next(error);
        }
    }

    async fetchUserAddress(req:Request, res: Response, next: NextFunction) {
        try{
            const { id: userId } = ValidateObjectId(req.params.userId, "User ID");
            if(!userId) throw new Error("Invalid request.");
            const result = await this.adminFetchUserOrProviderAddressUseCase.execute(new Types.ObjectId(userId));
            res.status(200).json(result);
        }catch(error){
            console.log("fetchUserAddress error : ",error);
            next(error);
        }
    }
}

const adminUserController = new AdminUserController(
    adminUserListUseCase,
    adminChangeUserBlockStatusUseCase,
    adminFetchUserDetailsUseCase,
    adminFetchUserOrProviderAddressUseCase
);
export { adminUserController };

