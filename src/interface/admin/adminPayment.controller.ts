import { NextFunction, Request, Response } from "express";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { AdminFetchAllPaymentsUseCase } from "../../application/admin-use.case/adminPayment.use-case";

const paymentRepositoryImpl = new PaymentRepositoryImpl();

const adminFetchAllPaymentsUseCase = new AdminFetchAllPaymentsUseCase(paymentRepositoryImpl);

export class AdminPaymentController {
    constructor(
        private adminFetchAllPaymentsUseCase: AdminFetchAllPaymentsUseCase,
    ) {
        this.getAllPayments = this.getAllPayments.bind(this);
    }

    async getAllPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminFetchAllPaymentsUseCase.execute({ page, limit });
            res.status(200).json(result);
        } catch (error) {
            console.log("getAllPayments error : ", error);
            next(error)
        }
    }
}

const adminPaymentController = new AdminPaymentController(
    adminFetchAllPaymentsUseCase
);
export { adminPaymentController };
