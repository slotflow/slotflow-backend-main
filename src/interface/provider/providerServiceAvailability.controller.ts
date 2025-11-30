import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { DateZodSchema } from "../../infrastructure/zod/common.zod";
import { ProviderCreateServiceAvailabilityZodSchema } from "../../infrastructure/zod/provider.zod";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";
import { ProviderCreateServiceAvailabilitiesUseCase, ProviderFetchServiceAvailabilityUseCase } from "../../application/provider-use.case/providerServiceAvailability.use-case";

const providerRepositoryImpl = new ProviderRepositoryImpl();
const serviceAvailabilityRepositoryImpl = new ServiceAvailabilityRepositoryImpl();

const providerCreateServiceAvailabilitiesUseCase = new ProviderCreateServiceAvailabilitiesUseCase(providerRepositoryImpl, serviceAvailabilityRepositoryImpl);
const providerFetchServiceAvailabilityUseCase = new ProviderFetchServiceAvailabilityUseCase(serviceAvailabilityRepositoryImpl);

class ProviderServiceAvailabilityController {
    constructor(
        private providerCreateServiceAvailabilitiesUseCase: ProviderCreateServiceAvailabilitiesUseCase,
        private providerFetchServiceAvailabilityUseCase: ProviderFetchServiceAvailabilityUseCase,
    ) {
        this.createServiceAvailability = this.createServiceAvailability.bind(this);
        this.getServiceAvailability = this.getServiceAvailability.bind(this);
    }

    async createServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const availabilities = ProviderCreateServiceAvailabilityZodSchema.parse(req.body);
            if (!providerId || !availabilities || availabilities.length === 0) throw new Error("Invalid request.");
            const result = await this.providerCreateServiceAvailabilitiesUseCase.execute({ providerId: new Types.ObjectId(providerId), availabilities });
            res.status(200).json(result);
        } catch (error) {
            console.log("createServiceAvailability error : ",error);
            next(error)
        }
    }

    async getServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { date } = DateZodSchema.parse(req.query);
            if (!providerId || !date) throw new Error("Invalid request.");
            const result = await this.providerFetchServiceAvailabilityUseCase.execute({ providerId: new Types.ObjectId(providerId), date: new Date(date) });
            res.status(200).json(result);
        } catch (error) {
            console.log("getServiceAvailability error : ",error);
            next(error)
        }
    }

}

const providerServiceAvailabilityController = new ProviderServiceAvailabilityController(
    providerCreateServiceAvailabilitiesUseCase,
    providerFetchServiceAvailabilityUseCase
);
export { providerServiceAvailabilityController };