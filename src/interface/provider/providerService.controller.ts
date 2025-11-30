import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { ProviderCreateServiceDetailsZodSchema } from "../../infrastructure/zod/provider.zod";
import { CreateProviderServiceRequest } from "../../domain/repositories/IProviderService.repository";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ProviderServiceRepositoryImpl } from "../../infrastructure/database/providerService/providerService.repository.impl";
import { ProviderCreateServiceDetailsUseCase, ProviderFetchServiceDetailsUseCase } from "../../application/provider-use.case/providerService.use-case";

const providerRepositoryImpl = new ProviderRepositoryImpl();
const providerServiceRepositoryImpl = new ProviderServiceRepositoryImpl();

const providerCreateServiceDetailsUseCase = new ProviderCreateServiceDetailsUseCase(providerRepositoryImpl, providerServiceRepositoryImpl);
const providerFetchServiceDetailsUseCase = new ProviderFetchServiceDetailsUseCase(providerServiceRepositoryImpl);

class ProviderServiceController {
    constructor(
        private providerCreateServiceDetailsUseCase: ProviderCreateServiceDetailsUseCase,
        private providerFetchServiceDetailsUseCase: ProviderFetchServiceDetailsUseCase,
    ) {
        this.createServiceDetails = this.createServiceDetails.bind(this);
        this.getServiceDetails = this.getServiceDetails.bind(this);
    }

    async createServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const validateData = ProviderCreateServiceDetailsZodSchema.parse(req.body);
            const payload: CreateProviderServiceRequest = {
                ...validateData,
                providerId: new Types.ObjectId(providerId),
                serviceCategory: new Types.ObjectId(validateData.serviceCategory),
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

}

const providerServiceController = new ProviderServiceController(
    providerCreateServiceDetailsUseCase,
    providerFetchServiceDetailsUseCase
);
export { providerServiceController };