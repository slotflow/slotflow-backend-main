import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { paginationSchema } from "../../shared/zod/common.zod";
import { adminFetchRevenuewReposrtSchema } from "../../shared/zod/admin.zod";
import { adminFetchAllPaymentsUseCase, adminFetchRevenueReportUseCase } from ".";
import { AdminFetchAllPaymentsUseCase, AdminFetchRevenueReportUseCase } from "../../application/useCases/admin/adminPayment.useCase";

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
            const { page, limit } = paginationSchema.parse(req.query);
            const result = await this.adminFetchAllPaymentsUseCase.execute({ page, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("getAllPayments failed", error as Error);
            next(error);
        };
    };

    async fetchRevenueReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { endDate, limit, page, startDate } = adminFetchRevenuewReposrtSchema.parse({
                ...req.body,
                ...req.query
            });
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
            // TODO
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
