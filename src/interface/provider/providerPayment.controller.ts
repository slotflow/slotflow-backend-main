import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { RequestQueryCommonZodSchema } from "../../infrastructure/zod/common.zod";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ProviderFetchAllPaymentsUseCase } from "../../application/provider-use.case/providerPayment.use-case";

const paymentRepositoryImpl = new PaymentRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();

const providerFetchAllPaymentsUseCase = new ProviderFetchAllPaymentsUseCase(providerRepositoryImpl, paymentRepositoryImpl)

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