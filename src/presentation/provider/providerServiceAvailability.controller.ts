import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { fetchProviderServiceAvailabilitySchema } from "../../shared/zod/common.zod";
import { providerCreateServiceAvailabilitySchema, validateProviderIdSchema } from "../../shared/zod/provider.zod";
import { providerCreateServiceAvailabilitiesUseCase, providerFetchServiceAvailabilityUseCase } from ".";
import { ProviderCreateServiceAvailabilitiesUseCase, ProviderFetchServiceAvailabilityUseCase } from "../../application/useCases/provier/providerServiceAvailability.useCase";

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
            const { providerId } = validateProviderIdSchema.parse((req.user as DecodedUser).userOrProviderId);
            const availabilities = providerCreateServiceAvailabilitySchema.parse(req.body);
            if (!availabilities || availabilities.length === 0) throw new Error("Invalid request.");
            await this.providerCreateServiceAvailabilitiesUseCase.execute({ providerId, availabilities });
            sendResponse(res, null, "Service availability saved successfully", true, 201);
        } catch (error) {
            log.error("createServiceAvailability failed", error as Error);
            next(error);
        };
    };

    async getServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, providerId } = fetchProviderServiceAvailabilitySchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                date: req.query.date
            });
            const result = await this.providerFetchServiceAvailabilityUseCase.execute({ providerId, date: new Date(date) });
            sendResponse(res, result);
        } catch (error) {
            log.error("getServiceAvailability failed", error as Error);
            next(error);
        };
    };

};

export const providerServiceAvailabilityController = new ProviderServiceAvailabilityController(
    providerCreateServiceAvailabilitiesUseCase,
    providerFetchServiceAvailabilityUseCase
);