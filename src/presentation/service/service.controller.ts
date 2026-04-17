import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { getServicesSchema } from "../../shared/zod/service.zod";
import { DecodedUser } from "../../application/dtos/common.dto";
import { GetServicesUseCase } from "../../application/useCases/service/getServices.useCase";
import { CreateServiceUseCase } from "../../application/useCases/service/createService.useCase";
import { adminCreateNewServiceSchema, adminChangeServiceBlockStatusSchema } from "../../shared/zod/admin.zod";
import { ChangeServiceBlockStatusUseCase } from "../../application/useCases/service/changeBlockStatus.useCase";
import { GetServicesByCategoryUseCase } from "../../application/useCases/service/getServicesByCategory.useCase";
import { changeServiceBlockStatusUseCase, createServiceUseCase, getServicesByCategoryUseCase, getServicesUseCase } from ".";

class ServiceController {
    constructor(
        private getServicesUseCase: GetServicesUseCase,
        private createServiceUseCase: CreateServiceUseCase,
        private changeServiceBlockStatusUseCase: ChangeServiceBlockStatusUseCase,
        private getServicesByCategoryUseCase: GetServicesByCategoryUseCase
    ) {
        this.getServices = this.getServices.bind(this);
        this.createService = this.createService.bind(this);
        this.changeServiceBlockStatus = this.changeServiceBlockStatus.bind(this);
    };

    async getServices(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;

            const { page, limit, serviceCategory } = getServicesSchema.parse(req.query);

            if (user.role === Role.ADMIN) {
                const result = await this.getServicesUseCase.execute({ page, limit });
                sendResponse(res, result);
            } else if(serviceCategory) {
                const result = await this.getServicesByCategoryUseCase.execute({ categories: serviceCategory });
                sendResponse(res, result);
            }

        } catch (error) {
            log.error("getAllServices failed", error as Error);
            next(error);
        };
    };

    async createService(req: Request, res: Response, next: NextFunction) {
        try {
            const { serviceCategory, serviceName } = adminCreateNewServiceSchema.parse(req.body);
            const result = await this.createServiceUseCase.execute({
                serviceCategory: serviceCategory,
                serviceName: serviceName
            });
            sendResponse(res, result, "Service saved successfully", true, 201);
        } catch (error) {
            log.error("createService failed", error as Error);
            next(error);
        };
    };

    async changeServiceBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus, serviceId } = adminChangeServiceBlockStatusSchema.parse({
                serviceId: req.params.serviceId,
                blockStatus: req.body.blockStatus
            });
            const result = await this.changeServiceBlockStatusUseCase.execute({ serviceId, isBlocked: blockStatus });
            sendResponse(res, result, `Successfully ${result.isBlocked ? "blocked" : "unblocked"} service`);
        } catch (error) {
            log.error("changeServiceBlockStatus failed", error as Error);
            next(error);
        };
    };

};

export const serviceController = new ServiceController(
    getServicesUseCase,
    createServiceUseCase,
    changeServiceBlockStatusUseCase,
    getServicesByCategoryUseCase
);
