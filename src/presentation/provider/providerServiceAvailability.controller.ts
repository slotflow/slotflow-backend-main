import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DateZodSchema } from "../../shared/zod/common.zod";
import { ProviderCreateServiceAvailabilityZodSchema } from "../../shared/zod/provider.zod";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { IServiceAvailabilityQueries } from "../../application/queries/IServiceAvailability.queries";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ServiceAvailabilityQueriesImpl } from "../../infrastructure/queries/serviceAvailabilityQueries.impl";
import { IServiceAvailabilityRepository } from "../../domain/interfaces/repositories/IServiceAvailability.repository";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";
import { ProviderCreateServiceAvailabilitiesUseCase, ProviderFetchServiceAvailabilityUseCase } from "../../application/useCases/provier/providerServiceAvailability.useCase";

const providerRepository: IProviderRepository = new ProviderRepositoryImpl();
const serviceAvailabilityQueries: IServiceAvailabilityQueries = new ServiceAvailabilityQueriesImpl();
const serviceAvailabilityRepository: IServiceAvailabilityRepository = new ServiceAvailabilityRepositoryImpl();

const providerFetchServiceAvailabilityUseCase = new ProviderFetchServiceAvailabilityUseCase(serviceAvailabilityQueries);
const providerCreateServiceAvailabilitiesUseCase = new ProviderCreateServiceAvailabilitiesUseCase(providerRepository, serviceAvailabilityRepository);

class ProviderServiceAvailabilityController {
    constructor(
        private providerCreateServiceAvailabilitiesUseCase: ProviderCreateServiceAvailabilitiesUseCase,
        private providerFetchServiceAvailabilityUseCase: ProviderFetchServiceAvailabilityUseCase,
    ) {
        this.createServiceAvailability = this.createServiceAvailability.bind(this);
        this.getServiceAvailability = this.getServiceAvailability.bind(this);
    };

    async createServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const availabilities = ProviderCreateServiceAvailabilityZodSchema.parse(req.body);
            if (!providerId || !availabilities || availabilities.length === 0) throw new Error("Invalid request.");
            await this.providerCreateServiceAvailabilitiesUseCase.execute({ providerId, availabilities });
            sendResponse(res,null,"Service availability saved successfully",true,201);
        } catch (error) {
            log.error("createServiceAvailability failed",error as Error);
            next(error);
        };
    };

    async getServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { date } = DateZodSchema.parse(req.query);
            if (!providerId || !date) throw new Error("Invalid request.");
            const result = await this.providerFetchServiceAvailabilityUseCase.execute({ providerId, date: new Date(date) });
            sendResponse(res, result);
        } catch (error) {
            log.error("getServiceAvailability failed",error as Error);
            next(error);
        };
    };

};

export const providerServiceAvailabilityController = new ProviderServiceAvailabilityController(
    providerCreateServiceAvailabilitiesUseCase,
    providerFetchServiceAvailabilityUseCase
);