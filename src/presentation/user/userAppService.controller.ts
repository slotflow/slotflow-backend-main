import { NextFunction, Request, Response } from "express";
import { IServiceRepository } from "../../domain/interfaces/repositories/IService.repository";
import { UserFetchAllAppServiceUseCase } from "../../application/useCases/user/userAppService.useCase";
import { ServiceRepositoryImpl } from "../../infrastructure/database/appservice/service.repository.impl";

const serviceRepository: IServiceRepository = new ServiceRepositoryImpl();

const userFetchAllAppServiceUseCase = new UserFetchAllAppServiceUseCase(serviceRepository);

export class UserAppServiceController {
    constructor(
        private userFetchAllAppServiceUseCase: UserFetchAllAppServiceUseCase
    ) {
        this.fetchAllAppService = this.fetchAllAppService.bind(this);
    }
    async fetchAllAppService(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.userFetchAllAppServiceUseCase.execute();
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchAllAppService error : ", error);
            next(error);
        }
    }
}

const userAppServiceController = new UserAppServiceController(
    userFetchAllAppServiceUseCase
);

export { userAppServiceController };