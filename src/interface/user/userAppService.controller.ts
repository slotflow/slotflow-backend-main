import { NextFunction, Request, Response } from "express";
import { UserFetchAllAppServiceUseCase } from "../../application/user-use.case/userAppService.use-case";
import { ServiceRepositoryImpl } from "../../infrastructure/database/appservice/service.repository.impl";

const serviceRepositoryImpl = new ServiceRepositoryImpl();
const userFetchAllAppServiceUseCase = new UserFetchAllAppServiceUseCase(serviceRepositoryImpl);

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