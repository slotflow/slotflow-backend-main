import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/helpers/response";
import { AuthUser } from "../../application/dtos/common.dto";
import { adminUpdateServiceSchema, getServicesSchema } from "../../shared/zod/service.zod";
import { GetServicesUseCase } from "../../application/useCases/service/getServices.useCase";
import { UpdateServiceUseCase } from "../../application/useCases/service/updateService.useCase";
import { CreateServicesUseCase } from "../../application/useCases/service/createServices.useCase";
import { adminCreateServiceSchema, adminChangeServiceBlockStatusSchema } from "../../shared/zod/service.zod";
import { ChangeServiceBlockStatusUseCase } from "../../application/useCases/service/changeBlockStatus.useCase";
import { GetServicesByCategoryUseCase } from "../../application/useCases/service/getServicesByCategory.useCase";
import { changeServiceBlockStatusUseCase, createServicesUseCase, getServicesByCategoryUseCase, getServicesUseCase, updateServiceUseCase } from ".";

class ServiceController {
    constructor(
        private readonly getServicesUseCase: GetServicesUseCase,
        private readonly createServicesUseCase: CreateServicesUseCase,
        private readonly changeServiceBlockStatusUseCase: ChangeServiceBlockStatusUseCase,
        private readonly getServicesByCategoryUseCase: GetServicesByCategoryUseCase,
        private readonly updateServiceUseCase: UpdateServiceUseCase
    ) {
        this.getServices = this.getServices.bind(this);
        this.createServices = this.createServices.bind(this);
        this.changeServiceBlockStatus = this.changeServiceBlockStatus.bind(this);
        this.updateService = this.updateService.bind(this);
    };

    async getServices(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as AuthUser;
            const { page, limit, serviceCategory } = getServicesSchema.parse(req.query);
            if (user.role === Role.ADMIN) {
                const result = await this.getServicesUseCase.execute({ page, limit });
                sendResponse(res, result);
            } else if (serviceCategory) {
                const result = await this.getServicesByCategoryUseCase.execute({ categories: serviceCategory });
                sendResponse(res, result);
            }
        } catch (error) {
            log.error("getAllServices failed", error as Error);
            next(error);
        };
    };

    async createServices(req: Request, res: Response, next: NextFunction) {
        try {
            const { serviceCategory, serviceNames } = adminCreateServiceSchema.parse(req.body);
            const result = await this.createServicesUseCase.execute({
                serviceCategory: serviceCategory,
                serviceNames
            });
            sendResponse(res, result, "Service saved successfully", true, 201);
        } catch (error) {
            log.error("createService failed", error as Error);
            next(error);
        };
    };

    async changeServiceBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { isBlocked, serviceId } = adminChangeServiceBlockStatusSchema.parse({
                serviceId: req.params.serviceId,
                ...req.body
            });
            const result = await this.changeServiceBlockStatusUseCase.execute({
                serviceId,
                isBlocked
            });
            sendResponse(res, result, `Successfully ${result.isBlocked ? "blocked" : "unblocked"} service`);
        } catch (error) {
            log.error("changeServiceBlockStatus failed", error as Error);
            next(error);
        };
    };

    async updateService(req: Request, res: Response, next: NextFunction) {
        try {
            const { serviceId, ...validatedData } = adminUpdateServiceSchema.parse({
                serviceId: req.params.serviceId,
                ...req.body
            });
            const result = await this.updateServiceUseCase.execute({
                serviceId,
                ...validatedData
            });
            sendResponse(res, result, 'Service updated successfully');
        } catch (error) {
            log.error("updateService failed", error as Error);
            next(error);
        };
    };

};

export const serviceController = new ServiceController(
    getServicesUseCase,
    createServicesUseCase,
    changeServiceBlockStatusUseCase,
    getServicesByCategoryUseCase,
    updateServiceUseCase
);
