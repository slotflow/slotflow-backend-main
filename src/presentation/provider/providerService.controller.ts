import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { ValidateObjectId } from "../../shared/zod/common.zod";
import { ProviderCreateServiceDetailsZodSchema } from "../../shared/zod/provider.zod";
import { IProviderServiceQueries } from "../../application/queries/IProviderService.queries";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { ProviderServiceQueriesImpl } from "../../infrastructure/queries/providerServiceQueries.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { IProviderServiceRepository } from "../../domain/interfaces/repositories/IProviderService.repository";
import { ProviderServiceRepositoryImpl } from "../../infrastructure/database/providerService/providerService.repository.impl";
import { ProviderCreateServiceDetailsUseCase, ProviderFetchServiceDetailsUseCase, ProviderUpdateServiceDetailsUseCase } from "../../application/useCases/provier/providerService.useCase";

const providerRepository: IProviderRepository = new ProviderRepositoryImpl();
const providerServiceRepository: IProviderServiceRepository = new ProviderServiceRepositoryImpl();
const providerServiceQueries: IProviderServiceQueries = new ProviderServiceQueriesImpl();

const providerFetchServiceDetailsUseCase = new ProviderFetchServiceDetailsUseCase(providerServiceQueries);
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
    };

    async createServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const validatedData = ProviderCreateServiceDetailsZodSchema.parse(req.body);
            await this.providerCreateServiceDetailsUseCase.execute({
                ...validatedData,
                providerId,
                requirements: validatedData.requirements ?? null,
                videoUrl: validatedData.videoUrl ?? null
            });
            sendResponse(res, null, "Service details saved successfully", true, 201);
        } catch (error) {
            log.error("createServiceDetails failed", error as Error);
            next(error);
        };
    };

    async getServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.providerFetchServiceDetailsUseCase.execute({ providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getServiceDetails failed", error as Error);
            next(error);
        };
    };

    async updateServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: serviceId } = ValidateObjectId(req.params.serviceId, "Service ID");
            const validatedData = ProviderCreateServiceDetailsZodSchema.parse(req.body);
            const result = await this.providerUpdateServiceDetailsUseCase.execute({
                ...validatedData,
                _id: serviceId,
            });
            sendResponse(res, result, "Service details updated successfully");
        } catch (error) {
            log.error("updateServiceDetails failed", error as Error);
            next(error);
        };
    };

};

export const providerServiceController = new ProviderServiceController(
    providerCreateServiceDetailsUseCase,
    providerFetchServiceDetailsUseCase,
    providerUpdateServiceDetailsUseCase
);