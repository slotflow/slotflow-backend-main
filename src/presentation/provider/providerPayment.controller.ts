import { log } from "../../shared/logger/logger";
import { providerFetchAllPaymentsUseCase } from ".";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { providerIdWithPaginationSchema } from "../../shared/zod/provider.zod";
import { ProviderFetchAllPaymentsUseCase } from "../../application/useCases/provier/providerPayment.useCase";

class ProviderPaymentController {
    constructor(
        private providerFetchAllPaymentsUseCase: ProviderFetchAllPaymentsUseCase
    ) {
        this.getPayments = this.getPayments.bind(this);
    };

    async getPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const { limit, page, providerId } = providerIdWithPaginationSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.query
            });
            const result = await this.providerFetchAllPaymentsUseCase.execute({ providerId, page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("getPayments failed", error as Error);
            next(error);
        };
    };

};

export const providerPaymentController = new ProviderPaymentController(
    providerFetchAllPaymentsUseCase
);