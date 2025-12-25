import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { IServiceRepository } from "../../domain/interfaces/repositories/IService.repository";
import { UserFetchAllAppServiceUseCase } from "../../application/useCases/user/userAppService.useCase";
import { ServiceRepositoryImpl } from "../../infrastructure/database/service/service.repository.impl";

const serviceRepository: IServiceRepository = new ServiceRepositoryImpl();

const userFetchAllAppServiceUseCase = new UserFetchAllAppServiceUseCase(serviceRepository);

export class UserAppServiceController {
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