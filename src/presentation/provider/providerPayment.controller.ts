import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { ProviderFetchAllPaymentsUseCase } from "../../application/useCases/provier/providerPayment.useCase";

const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();

const providerFetchAllPaymentsUseCase = new ProviderFetchAllPaymentsUseCase(paymentRepository)

class ProviderPaymentController {
    constructor(
        private providerFetchAllPaymentsUseCase: ProviderFetchAllPaymentsUseCase
    ) {
        this.getPayments = this.getPayments.bind(this);
    };

    async getPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            if (!providerId) throw new Error("Invalid requeest.");
            const result = await this.providerFetchAllPaymentsUseCase.execute({ providerId, page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("getPayments failed",error as Error);
            next(error);
        };
    };

};

export const providerPaymentController = new ProviderPaymentController(
    providerFetchAllPaymentsUseCase
);