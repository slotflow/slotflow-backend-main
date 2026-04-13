import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { createServiceAvailabilitiesUseCase, getServiceAvailabilityUseCase } from ".";
import { GetServiceAvailabilityUseCase } from "../../application/useCases/serviceAvailability/getServiceAvailability";
import { createServiceAvailabilitySchema, getServiceAvailabilitySchema } from "../../shared/zod/serviceAvailability.zod";
import { CreateServiceAvailabilitiesUseCase } from "../../application/useCases/serviceAvailability/createServiceAvailability";

class ServiceAvailabilityController {
    constructor(
        private readonly createServiceAvailabilitiesUseCase: CreateServiceAvailabilitiesUseCase,
        private readonly getServiceAvailabilityUseCase: GetServiceAvailabilityUseCase
    ) {
        this.createServiceAvailability = this.createServiceAvailability.bind(this);
        this.getServiceAvailability = this.getServiceAvailability.bind(this);
    };

    async createServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const availabilities = createServiceAvailabilitySchema.parse(req.body);
            if (!availabilities || availabilities.length === 0) throw new Error("Invalid request.");
            await this.createServiceAvailabilitiesUseCase.execute({ providerId: user.userOrProviderId, availabilities });
            sendResponse(res, null, "Service availability saved successfully", true, 201);
        } catch (error) {
            log.error("createServiceAvailability failed", error as Error);
            next(error);
        };
    };

    async getServiceAvailability(req: Request, res: Response, next: NextFunction) {
            try {
                const user = req.user as DecodedUser;

                let providerId: string | undefined;

                if(user.role === Role.PROVIDER) {
                    providerId = user.userOrProviderId;
                } else {
                    providerId = req.params.providerId as string;
                }
                
                const validatedData = getServiceAvailabilitySchema.parse({
                    providerId,
                    date: req.query.date
                });
                const result = await this.getServiceAvailabilityUseCase.execute({ 
                    providerId: validatedData.providerId, 
                    date: new Date(validatedData.date) 
                });
                sendResponse(res, result);
            } catch (error) {
                log.error("getServiceAvailability failed", error as Error);
                next(error);
            };
        };
}

export const serviceAvailabilityController = new ServiceAvailabilityController(
    createServiceAvailabilitiesUseCase,
    getServiceAvailabilityUseCase
);