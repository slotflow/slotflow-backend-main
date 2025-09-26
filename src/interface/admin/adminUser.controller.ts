import { Types } from "mongoose";
import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { AdminChangeUserBlockStatusZOdSchema } from "../../infrastructure/zod/admin.zod";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { RequestQueryCommonZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { AdminFetchUserOrProviderAddressUseCase } from "../../application/admin-use.case/adminAddress.use-case";
import { AdminChangeUserBlockStatusUseCase, AdminFetchUserDetailsUseCase, AdminUserListUseCase } from "../../application/admin-use.case/adminUser.use-case";

const userRepositoryImpl = new UserRepositoryImpl();
const addressRepositoryImpl = new AddressRepositoryImpl();

const adminUserListUseCase = new AdminUserListUseCase(userRepositoryImpl);
const adminFetchUserDetailsUseCase = new AdminFetchUserDetailsUseCase(userRepositoryImpl);
const adminChangeUserBlockStatusUseCase = new AdminChangeUserBlockStatusUseCase(userRepositoryImpl);
const adminFetchUserOrProviderAddressUseCase = new AdminFetchUserOrProviderAddressUseCase(addressRepositoryImpl);

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

    async getAllUsers(req: Request, res: Response) {
        try {
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminUserListUseCase.execute({ page, limit });
            res.status(200).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async changeUserBlockStatus(req: Request, res: Response) {
        try {
            const { blockStatus } = AdminChangeUserBlockStatusZOdSchema.parse(req.body);
            const { id: userId } = ValidateObjectId(req.params.userId, "User ID");
            if (!userId || blockStatus === null) throw new Error("Invalid request");
            const result = await this.adminChangeUserBlockStatusUseCase.execute({ userId: new Types.ObjectId(userId), isBlocked: blockStatus });
            res.status(204).json(result);
        } catch (error) {
            HandleError.handle(error, res);
        }
    }

    async fetchUserDetails(req: Request, res: Response) {
         try{
            const { id: userId } = ValidateObjectId(req.params.userId, "User ID");
            if(!userId) throw new Error("Invalid request.");
            const result = await this.adminFetchUserDetailsUseCase.execute(new Types.ObjectId(userId));
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error,res);
        }
    }

    async fetchUserAddress(req:Request, res: Response) {
        try{
            const { id: userId } = ValidateObjectId(req.params.userId, "User ID");
            if(!userId) throw new Error("Invalid request.");
            const result = await this.adminFetchUserOrProviderAddressUseCase.execute(new Types.ObjectId(userId));
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error,res);
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

