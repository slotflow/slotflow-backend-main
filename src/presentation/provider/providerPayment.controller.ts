import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ProviderFetchAllPaymentsUseCase } from "../../application/useCases/provier/providerPayment.useCase";

const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();
const providerRepository: IProviderRepository = new ProviderRepositoryImpl();

const providerFetchAllPaymentsUseCase = new ProviderFetchAllPaymentsUseCase(providerRepository, paymentRepository)

export class ProviderPaymentController {
    constructor(
        private providerFetchAllPaymentsUseCase: ProviderFetchAllPaymentsUseCase
    ) {
        this.getPayments = this.getPayments.bind(this);
    }

    async getPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            if (!providerId) throw new Error("Invalid requeest.");
            const result = await this.providerFetchAllPaymentsUseCase.execute({ providerId: new Types.ObjectId(providerId), page, limit });
            res.status(200).json(result);
        } catch (error) {
            console.log("getPayments error : ",error);
            next(error)
        }
    }
}

const providerPaymentController = new ProviderPaymentController(
    providerFetchAllPaymentsUseCase
);
export { providerPaymentController };