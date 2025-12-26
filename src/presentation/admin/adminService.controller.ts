import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { AdminAddServiceXZodSchema } from "../../shared/zod/admin.zod";
import { IServiceRepository } from "../../domain/interfaces/repositories/IService.repository";
import { ServiceRepositoryImpl } from "../../infrastructure/database/service/service.repository.impl";
import { changeBlockStatusZodSchema, RequestQueryCommonZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
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
    };

    async getAllServices(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminServiceListUseCase.execute({ page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("getAllServices failed",error as Error);
            next(error);
        };
    };

    async createService(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = AdminAddServiceXZodSchema.parse(req.body);
            const result = await this.adminCreateServiceUseCase.execute({
                serviceCategory: validatedData.serviceCategory,
                serviceName: validatedData.serviceName
            });
            sendResponse(res,result,"Service saved successfully",true, 201);
        } catch (error) {
            log.error("createService failed",error as Error);
            next(error);
        };
    };

    async changeServiceBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus } = changeBlockStatusZodSchema.parse(req.body);
            const { id: serviceId } = ValidateObjectId(req.params.serviceId, "Service ID");
            const result = await this.adminChnageServiceBlockStatusUseCase.execute({ serviceId, isBlocked: blockStatus });
            sendResponse(res, result, `Successfully ${result.isBlocked ? "blocked" : "unblocked"} service`);
        } catch (error) {
            log.error("changeServiceBlockStatus failed", error as Error);
            next(error);
        };
    };

};

export const adminServiceController = new AdminServiceController(
    adminServiceListUseCase,
    adminCreateServiceUseCase,
    adminChnageServiceBlockStatusUseCase
);
