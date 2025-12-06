import { NextFunction, Request, Response } from "express";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";
import { AdminFetchAllPaymentsUseCase } from "../../application/useCases/admin/adminPayment.useCase";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";

const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();

const adminFetchAllPaymentsUseCase = new AdminFetchAllPaymentsUseCase(paymentRepository);

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
