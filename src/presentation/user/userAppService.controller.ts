import { log } from "../../shared/logger/logger";
import { userFetchAllAppServiceUseCase } from ".";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { UserFetchAllAppServiceUseCase } from "../../application/useCases/user/userAppService.useCase";

class UserAppServiceController {
    constructor(
        private userFetchAllAppServiceUseCase: UserFetchAllAppServiceUseCase
    ) {
        this.fetchAllAppService = this.fetchAllAppService.bind(this);
    };

    async fetchAllAppService(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.userFetchAllAppServiceUseCase.execute();
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchAllAppService failed", error as Error);
            next(error);
        };
    };

};

export const userAppServiceController = new UserAppServiceController(
    userFetchAllAppServiceUseCase
);