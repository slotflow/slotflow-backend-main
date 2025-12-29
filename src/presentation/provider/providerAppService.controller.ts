import { log } from "../../shared/logger/logger";
import { providerFetchAllServicesUseCase } from ".";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { findServicesByCategoryName } from "../../shared/zod/common.zod";
import { ProviderFetchAllAppServicesUseCase } from "../../application/useCases/provier/providerAppServices.useCase";

class ProviderAppServiceController {
    constructor(
        private providerFetchAllServicesUseCase: ProviderFetchAllAppServicesUseCase,
    ) {
        this.getAllAppServices = this.getAllAppServices.bind(this);
    };

    async getAllAppServices(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("req.query : ",req.query);
            const validatedData = findServicesByCategoryName.parse(req.query);
            const result = await this.providerFetchAllServicesUseCase.execute({
                serviceCategory: validatedData.serviceCategory
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("getAllAppServices failed",error as Error);
            next(error);
        };
    };
    
};

export const providerAppServiceController = new ProviderAppServiceController(
    providerFetchAllServicesUseCase
);