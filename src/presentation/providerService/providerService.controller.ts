import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { createProviderServiceUseCase, getProviderServicesUseCase, getProvidersServicesUseCase, updateProviderServiceUseCase } from ".";
import { GetProviderServicesUseCase } from "../../application/useCases/providerService/getProviderService.useCase";
import { UpdateProviderServiceUseCase } from "../../application/useCases/providerService/updateProviderService.useCase";
import { CreateProviderServiceUseCase } from "../../application/useCases/providerService/createProviderService.useCase";
import { providerCreateServiceDetailsSchema, providerUpdateServiceDetailsSchema } from "../../shared/zod/provider.zod";
import { userGetProvidersServicesSchema } from "../../shared/zod/providerService.zod";
import { GetProvidersServicesUseCase } from "../../application/useCases/providerService/getProvidersServices.useCase";
import { BadRequestError } from "../../shared/error/appError";
import { ERROR_CODES } from "../../shared/utils/types";
import { validateProviderIdSchema } from "../../shared/zod/base.zod";

class ProviderServiceController {
    constructor(
        private readonly createProviderServiceUseCase: CreateProviderServiceUseCase,
        private readonly getProviderServicesUseCase: GetProviderServicesUseCase,
        private readonly updateProviderServiceUseCase: UpdateProviderServiceUseCase,
        private readonly getProvidersServicesUseCase: GetProvidersServicesUseCase
    ) {
        this.createServiceDetails = this.createServiceDetails.bind(this);
        this.getServiceDetails = this.getServiceDetails.bind(this);
        this.updateServiceDetails = this.updateServiceDetails.bind(this);
        this.getProvidersServices = this.getProvidersServices.bind(this);
    };

    async createServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;

            const { providerId, ...serviceData } = providerCreateServiceDetailsSchema.parse({
                providerId: user.userOrProviderId,
                ...req.body
            });
            await this.createProviderServiceUseCase.execute({
                ...serviceData,
                providerId,
                requirements: serviceData.requirements ?? null,
                videoUrl: serviceData.videoUrl ?? null
            });
            sendResponse(res, null, "Service details saved successfully", true, 201);
        } catch (error) {
            log.error("createServiceDetails failed", error as Error);
            next(error);
        };
    };

    async getServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;

            let filter: {
                providerId: string;
                isUser: boolean;
            }

            if (user.role === Role.USER) {
                filter = {
                    providerId: validateProviderIdSchema.parse(req.params.providerId).providerId,
                    isUser: true
                }
            } else if (user.role === Role.ADMIN) {
                filter = {
                    providerId: validateProviderIdSchema.parse(req.params.providerId).providerId,
                    isUser: false
                }
            } else {
                filter = {
                    providerId: user.userOrProviderId,
                    isUser: false
                }
            }
            const result = await this.getProviderServicesUseCase.execute(filter);
            sendResponse(res, result);
        } catch (error) {
            log.error("getServiceDetails failed", error as Error);
            next(error);
        };
    };

    async updateServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { serviceId, ...serviceData } = providerUpdateServiceDetailsSchema.parse({
                serviceId: req.params.serviceId,
                ...req.body,
            });
            const result = await this.updateProviderServiceUseCase.execute({
                ...serviceData,
                providerServiceId: serviceId,
            });
            sendResponse(res, result, "Service details updated successfully");
        } catch (error) {
            log.error("updateServiceDetails failed", error as Error);
            next(error);
        };
    };

    async getProvidersServices(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = userGetProvidersServicesSchema.parse(req.query);
            const { categories, location, maxPrice, minPrice, slotflowTrusted, appServiceIds, skip, limit } = validatedData;
            let serviceIds: string[] = [];
            if (appServiceIds) {
                const servicesArray = Array.isArray(appServiceIds)
                    ? appServiceIds
                    : appServiceIds.split(",");

                serviceIds = servicesArray.map(id => id);
            };
            const result = await this.getProvidersServicesUseCase.execute({ serviceIds, categories, location, maxPrice, minPrice, slotflowTrusted, skip, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("getProvidersServices failed", error as Error);
            next(error);
        }
    }

};

export const providerServiceController = new ProviderServiceController(
    createProviderServiceUseCase,
    getProviderServicesUseCase,
    updateProviderServiceUseCase,
    getProvidersServicesUseCase
);