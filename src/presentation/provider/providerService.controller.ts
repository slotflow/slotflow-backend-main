import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { ProviderCreateServiceDetailsZodSchema } from "../../shared/zod/provider.zod";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ProviderServiceRepositoryImpl } from "../../infrastructure/database/providerService/providerService.repository.impl";
import { CreateProviderServiceRequest, IProviderServiceRepository } from "../../domain/interfaces/repositories/IProviderService.repository";
import { ProviderCreateServiceDetailsUseCase, ProviderFetchServiceDetailsUseCase, ProviderUpdateServiceDetailsUseCase } from "../../application/useCases/provier/providerService.useCase";
import { ProviderUpdateProviderServiceRequest } from "../../application/dtos/provider.dto";
import { ValidateObjectId } from "../../shared/zod/common.zod";

const providerRepository: IProviderRepository = new ProviderRepositoryImpl();
const providerServiceRepository: IProviderServiceRepository = new ProviderServiceRepositoryImpl();

const providerFetchServiceDetailsUseCase = new ProviderFetchServiceDetailsUseCase(providerServiceRepository);
const providerCreateServiceDetailsUseCase = new ProviderCreateServiceDetailsUseCase(providerRepository, providerServiceRepository);
const providerUpdateServiceDetailsUseCase = new ProviderUpdateServiceDetailsUseCase(providerServiceRepository);

class ProviderServiceController {
    constructor(
        private providerCreateServiceDetailsUseCase: ProviderCreateServiceDetailsUseCase,
        private providerFetchServiceDetailsUseCase: ProviderFetchServiceDetailsUseCase,
        private providerUpdateServiceDetailsUseCase: ProviderUpdateServiceDetailsUseCase,
    ) {
        this.createServiceDetails = this.createServiceDetails.bind(this);
        this.getServiceDetails = this.getServiceDetails.bind(this);
        this.updateServiceDetails = this.updateServiceDetails.bind(this);
    }

    async createServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const validateData = ProviderCreateServiceDetailsZodSchema.parse(req.body);
            const payload: CreateProviderServiceRequest = {
                ...validateData,
                providerId: new Types.ObjectId(providerId),
                service: new Types.ObjectId(validateData.service),
            };
            const result = await this.providerCreateServiceDetailsUseCase.execute(payload);
            res.status(200).json(result);
        } catch (error) {
            console.log("createServiceDetails error : ", error);
            next(error)
        }
    }

    async getServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.providerFetchServiceDetailsUseCase.execute({ providerId: new Types.ObjectId(providerId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("getServiceDetails error : ", error);
            next(error)
        }
    }

    async updateServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("service updating");
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if (!providerId) throw new Error("Invalid request.");
            const { id: serviceId } = ValidateObjectId(req.params.serviceId, "Service ID");
            const validateData = ProviderCreateServiceDetailsZodSchema.parse(req.body);
            const payload: ProviderUpdateProviderServiceRequest = {
                ...validateData,
                providerId: new Types.ObjectId(providerId),
                service: new Types.ObjectId(validateData.service),
                serviceId: new Types.ObjectId(serviceId)
            };
            const result = await this.providerUpdateServiceDetailsUseCase.execute(payload);
            res.status(200).json(result);
        } catch (error) {
            console.log("updateServiceDetails error : ", error);
            next(error)
        }
    }

}

const providerServiceController = new ProviderServiceController(
    providerCreateServiceDetailsUseCase,
    providerFetchServiceDetailsUseCase,
    providerUpdateServiceDetailsUseCase
);
export { providerServiceController };