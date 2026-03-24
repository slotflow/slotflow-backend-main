import { getAddressUseCase } from "../address";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { validateProviderIdSchema } from "../../shared/zod/provider.zod";
import { GetAddressUseCase } from "../../application/useCases/address/getAddress.useCase";

class ProviderAddressController {
    constructor(
        private readonly getAddressUseCase: GetAddressUseCase
    ) {
        this.getProviderAddress = this.getProviderAddress.bind(this);
    };

     async getProviderAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({
                providerId: req.params.providerId
            });
            const result = await this.getAddressUseCase.execute({ userId: providerId });
            sendResponse(res, result, `Address ${result ? "fetched successfully" : "not added yet"}`);
        } catch (error) {
            log.error("getProviderAddress failed", error as Error);
            next(error);
        };
    };

};

export const provideAddressController = new ProviderAddressController(
    getAddressUseCase
);