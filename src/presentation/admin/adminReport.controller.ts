import { NextFunction, Request, Response } from "express";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { AdminFetchRevenueReportUseCase } from "../../application/useCases/admin/adminPayment.useCase";

const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();

const adminFetchRevenueReportUseCase = new AdminFetchRevenueReportUseCase(paymentRepository);

export class AdminReportController {
    constructor(
        private adminFetchRevenueReportUseCase: AdminFetchRevenueReportUseCase,
    ) {
        this.fetchRevenueReport = this.fetchRevenueReport.bind(this);
    }

    async fetchRevenueReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.body;
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminFetchRevenueReportUseCase.execute({
                page,
                limit,
                startDate,
                endDate
            })
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchRevenueReport error : ", error);
            next(error)
        }
    }

    async fetchRefundReport(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            console.log("fetchRefundReport error : ", error);
            next(error)
        }
    }

}

const adminReportController = new AdminReportController(adminFetchRevenueReportUseCase);
export { adminReportController }