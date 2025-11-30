import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { RequestQueryCommonZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";
import { ServiceRepositoryImpl } from "../../infrastructure/database/appservice/service.repository.impl";
import { AdminAddServiceXZodSchema, AdminChangeServiceBlockStatusZodSchema } from "../../infrastructure/zod/admin.zod";
import { AdminAddServiceUseCase, AdminChnageServiceBlockStatusUseCase, AdminServiceListUseCase } from "../../application/admin-use.case/adminService.use-case";

const serviceRepositoryImpl = new ServiceRepositoryImpl();

const adminServiceListUseCase = new AdminServiceListUseCase(serviceRepositoryImpl);
const adminAddServiceUseCase = new AdminAddServiceUseCase(serviceRepositoryImpl);
const adminChnageServiceBlockStatusUseCase = new AdminChnageServiceBlockStatusUseCase(serviceRepositoryImpl);

class AdminServiceController {
    constructor(
        private adminServiceListUseCase: AdminServiceListUseCase,
        private adminAddServiceUseCase: AdminAddServiceUseCase,
        private adminChnageServiceBlockStatusUseCase: AdminChnageServiceBlockStatusUseCase,
    ) {
        this.getAllServices = this.getAllServices.bind(this);
        this.createService = this.createService.bind(this);
        this.changeServiceBlockStatus = this.changeServiceBlockStatus.bind(this);
    }

    async getAllServices(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminServiceListUseCase.execute({ page, limit });
            res.status(200).json(result);
        } catch (error) {
            console.log("getAllServices error : ",error);
            next(error)
        }
    }

    async createService(req: Request, res: Response, next: NextFunction) {
        try {
            const { serviceName } = AdminAddServiceXZodSchema.parse(req.body);
            if (!serviceName) throw new Error("Invalid request.");
            const result = await this.adminAddServiceUseCase.execute({serviceName});
            res.status(200).json(result);
        } catch (error) {
            console.log("createService error : ",error);
            next(error)
        }
    }

    async changeServiceBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus } = AdminChangeServiceBlockStatusZodSchema.parse(req.body);
            const { id: serviceId } = ValidateObjectId(req.params.serviceId, "Service ID");
            const result = await this.adminChnageServiceBlockStatusUseCase.execute({ serviceId: new Types.ObjectId(serviceId), isBlocked: blockStatus });
            res.status(200).json(result);
        } catch (error) {
            next(error)
        }
    }

}

const adminServiceController = new AdminServiceController(
    adminServiceListUseCase,
    adminAddServiceUseCase,
    adminChnageServiceBlockStatusUseCase
);
export { adminServiceController };

