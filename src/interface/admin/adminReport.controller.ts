import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { RequestQueryCommonZodSchema } from "../../infrastructure/zod/common.zod";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { AdminFetchRevenueReportUseCase } from "../../application/admin-use.case/adminPayment.use-case";

const paymentRepositoryImpl = new PaymentRepositoryImpl();
const adminFetchRevenueReportUseCase = new AdminFetchRevenueReportUseCase(paymentRepositoryImpl);

export class AdminReportController {
    constructor(
        private adminFetchRevenueReportUseCase: AdminFetchRevenueReportUseCase,
    ) {
        this.fetchRevenueReport = this.fetchRevenueReport.bind(this);
    }

    async fetchRevenueReport(req: Request, res: Response) {
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
            HandleError.handle(error, res);
        }
    }

    async fetchRefundReport(req: Request, res: Response) {
        try {

        } catch (error) {
            console.log("fetchRefundReport error : ", error);
            HandleError.handle(error, res);
        }
    }

}

const adminReportController = new AdminReportController(adminFetchRevenueReportUseCase);
export { adminReportController }