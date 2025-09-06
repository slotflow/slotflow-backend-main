import { Types } from "mongoose";
import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { AdminChangeUserBlockStatusZOdSchema } from "../../infrastructure/zod/admin.zod";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { RequestQueryCommonZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";
import { AdminChangeUserBlockStatusUseCase, AdminUserListUseCase } from "../../application/admin-use.case/adminUser.use-case";

const userRepositoryImpl = new UserRepositoryImpl();
const adminUserListUseCase = new AdminUserListUseCase(userRepositoryImpl);
const adminChangeUserBlockStatusUseCase = new AdminChangeUserBlockStatusUseCase(userRepositoryImpl);

class AdminUserController {
    constructor(
        private adminUserListUseCase : AdminUserListUseCase,
        private adminChangeUserBlockStatusUseCase : AdminChangeUserBlockStatusUseCase,
    ){
        this.getAllUsers = this.getAllUsers.bind(this);
        this.changeUserBlockStatus = this.changeUserBlockStatus.bind(this);
    }

    async getAllUsers(req: Request, res: Response) {
        try{
            const validateQuery = RequestQueryCommonZodSchema.parse(req.query);
            const { page, limit } = validateQuery;
            const result = await this.adminUserListUseCase.execute({ page, limit });
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error, res);
        }
    }

    async changeUserBlockStatus(req: Request, res: Response) {
        try{
            const validateBody = AdminChangeUserBlockStatusZOdSchema.parse(req.body);
            const { blockStatus } = validateBody;
            const validateParams = ValidateObjectId(req.params.userId, "User ID");
            const { id: userId } = validateParams;
            if(!userId || blockStatus === null) throw new Error("Invalid request");
            const result = await this.adminChangeUserBlockStatusUseCase.execute({userId : new Types.ObjectId(userId), isBlocked: blockStatus });
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error, res);
        }
    }
}

const adminUserController = new AdminUserController(adminUserListUseCase, adminChangeUserBlockStatusUseCase);
export { adminUserController };

