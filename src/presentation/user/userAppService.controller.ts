import { fetchAllAppServicesUseCase } from ".";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { fetchAllAppServicesZodSchema } from "../../shared/zod/common.zod";
import { FetchAllAppServicesUseCase } from "../../application/useCases/common/fetchAppServices.useCase";

class UserAppServiceController {
    constructor(
        private fetchAllAppServicesUseCase: FetchAllAppServicesUseCase
    ) {
        this.fetchAllAppService = this.fetchAllAppService.bind(this);
    };

    async fetchAllAppService(req: Request, res: Response, next: NextFunction) {
        try {
            const { categories } = fetchAllAppServicesZodSchema.parse(req.query);
            const result = await this.fetchAllAppServicesUseCase.execute({ categories });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchAllAppService failed", error as Error);
            next(error);
        };
    };

};

export const userAppServiceController = new UserAppServiceController(
    fetchAllAppServicesUseCase
);