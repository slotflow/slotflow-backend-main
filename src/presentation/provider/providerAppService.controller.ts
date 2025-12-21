import { NextFunction, Request, Response } from "express";
import { findServicesByCategoryName } from "../../shared/zod/common.zod";
import { IServiceRepository } from "../../domain/interfaces/repositories/IService.repository";
import { ServiceRepositoryImpl } from "../../infrastructure/database/service/service.repository.impl";
import { ProviderFetchAllAppServicesUseCase } from "../../application/useCases/provier/providerAppServices.useCase";

const serviceRepository: IServiceRepository = new ServiceRepositoryImpl();

const providerFetchAllServicesUseCase = new ProviderFetchAllAppServicesUseCase(serviceRepository);

class ProviderAppServiceController {
    constructor(
        private providerFetchAllServicesUseCase: ProviderFetchAllAppServicesUseCase,
    ) {
        this.getAllAppServices = this.getAllAppServices.bind(this);
    }

    async getAllAppServices(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("req.query : ",req.query);
            const validatedData = findServicesByCategoryName.parse(req.query);
            const result = await this.providerFetchAllServicesUseCase.execute({
                serviceCategory: validatedData.serviceCategory
            });
            console.log("result : ",result);
            res.status(200).json(result);
        } catch (error) {
            console.log("getAllAppServices error : ",error);
            next(error)
        }
    }
}

const providerAppServiceController = new ProviderAppServiceController(
    providerFetchAllServicesUseCase
);
export { providerAppServiceController };