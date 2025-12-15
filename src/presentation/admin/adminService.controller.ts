import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { RequestQueryCommonZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { IServiceRepository } from "../../domain/interfaces/repositories/IService.repository";
import { ServiceRepositoryImpl } from "../../infrastructure/database/appservice/service.repository.impl";
import { AdminAddServiceXZodSchema, AdminChangeServiceBlockStatusZodSchema } from "../../shared/zod/admin.zod";
import { AdminCreateServiceUseCase, AdminChnageServiceBlockStatusUseCase, AdminServiceListUseCase } from "../../application/useCases/admin/adminService.useCase";

const serviceRepository: IServiceRepository = new ServiceRepositoryImpl();

const adminServiceListUseCase = new AdminServiceListUseCase(serviceRepository);
const adminCreateServiceUseCase = new AdminCreateServiceUseCase(serviceRepository);
const adminChnageServiceBlockStatusUseCase = new AdminChnageServiceBlockStatusUseCase(serviceRepository);

class AdminServiceController {
    constructor(
        private adminServiceListUseCase: AdminServiceListUseCase,
        private adminCreateServiceUseCase: AdminCreateServiceUseCase,
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
            const validatedData = AdminAddServiceXZodSchema.parse(req.body);
            const result = await this.adminCreateServiceUseCase.execute({...validatedData});
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
    adminCreateServiceUseCase,
    adminChnageServiceBlockStatusUseCase
);
export { adminServiceController };

