import { fetchAllAppServicesUseCase } from ".";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { fetchAllAppServicesSchema } from "../../shared/zod/common.zod";
import { FetchAllAppServicesUseCase } from "../../application/useCases/common/fetchAppServices.useCase";

class ProviderAppServiceController {
    constructor(
        private fetchAllAppServicesUseCase: FetchAllAppServicesUseCase,
    ) {
        this.getAllAppServices = this.getAllAppServices.bind(this);
    };

    async getAllAppServices(req: Request, res: Response, next: NextFunction) {
        try {
            const { categories } = fetchAllAppServicesSchema.parse(req.query);
            const result = await this.fetchAllAppServicesUseCase.execute({ categories });
            sendResponse(res, result);
        } catch (error) {
            log.error("getAllAppServices failed",error as Error);
            next(error);
        };
    };
    
};

export const providerAppServiceController = new ProviderAppServiceController(
    fetchAllAppServicesUseCase
);