import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { AdminChangeUserBlockStatusZOdSchema } from "../../shared/zod/admin.zod";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { RequestQueryCommonZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IAddressRepository } from "../../domain/interfaces/repositories/IAddress.repository";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { ISignedUrlCacheRepository } from "../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { AdminFetchUserOrProviderAddressUseCase } from "../../application/useCases/admin/adminAddress.useCase";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { AdminChangeUserBlockStatusUseCase, AdminFetchUserDetailsUseCase, AdminUserListUseCase } from "../../application/useCases/admin/adminUser.useCase";

const userRepository: IUserRepository = new UserRepositoryImpl();
const addressRepository: IAddressRepository = new AddressRepositoryImpl();
const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();

const signedUrlService = new SignedUrlService(signedUrlCacheRepository);

const adminUserListUseCase = new AdminUserListUseCase(userRepository);
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
            const result = await this.adminFetchUserOrProviderAddressUseCase.execute(userId);
           res.status(200).json({ 
                success: true, 
                message: result
                    ? "Address fetched successfully"
                    : "Address not added yet",
                data: result 
            });
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

