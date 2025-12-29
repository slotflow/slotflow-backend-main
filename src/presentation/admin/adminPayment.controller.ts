import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { RequestQueryCommonZodSchema } from "../../shared/zod/common.zod";
import { AdminFetchAllPaymentsUseCase, AdminFetchRevenueReportUseCase } from "../../application/useCases/admin/adminPayment.useCase";
import { adminFetchAllPaymentsUseCase, adminFetchRevenueReportUseCase } from ".";

class AdminPaymentController {
    constructor(
        private adminFetchAllPaymentsUseCase: AdminFetchAllPaymentsUseCase,
        private adminFetchRevenueReportUseCase: AdminFetchRevenueReportUseCase
    ) {
        this.getAllPayments = this.getAllPayments.bind(this);
        this.fetchRevenueReport = this.fetchRevenueReport.bind(this);
        this.fetchRefundReport = this.fetchRefundReport.bind(this);
    };

    async getAllPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminFetchAllPaymentsUseCase.execute({ page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("getAllPayments failed", error as Error);
            next(error);
        };
    };

    async fetchRevenueReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.body;
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminFetchRevenueReportUseCase.execute({
                page,
                limit,
                startDate,
                endDate
            });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchRevenueReport failed", error as Error);
            next(error);
        };
    };

    async fetchRefundReport(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            log.error("fetchRefundReport failed", error as Error);
            next(error);
        };
    };

};

export const adminPaymentController = new AdminPaymentController(
    adminFetchAllPaymentsUseCase,
    adminFetchRevenueReportUseCase
);
