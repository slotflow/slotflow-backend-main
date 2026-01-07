import { log } from "../../../shared/logger/logger";
import { IPaymentQueries } from "../../queries/IPayment.queries";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../../dtos/admin.dto";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest, TableData } from "../../dtos/common.dto";

export class AdminFetchAllPaymentsUseCase {
    constructor(
        private paymentRepository: IPaymentRepository,
    ) { };

    async execute(payload: FetchPaymentsRequest): Promise<TableData<FetchPaymentResponse>> {
        try {
            const { page, limit, userId, providerId } = payload;
            const result = await this.paymentRepository.findAll(page, limit, userId, providerId);

            const { data: payments, totalPages, currentPage, totalCount } = result;
            return {
                data: payments.map(payment => ({
                    _id: payment._id,
                    createdAt: payment.createdAt,
                    discountAmount: payment.discountAmount,
                    paymentFor: payment.paymentFor,
                    paymentGateway: payment.paymentGateway,
                    paymentMethod: payment.paymentMethod,
                    paymentStatus: payment.paymentStatus,
                    totalAmount: payment.totalAmount
                })),
                totalPages,
                currentPage,
                totalCount
            };
        } catch (error) {
            log.error("AdminFetchAllPaymentsUseCase failed", error as Error);
            throw error;
        };
    };
};

export class AdminFetchRevenueReportUseCase {
    constructor(
        private paymentQueries: IPaymentQueries,
    ) { };

    async execute(payload: AdminFetchRevenueReportRequest): Promise<ApiResponse<AdminFetchRevenueReportResponse>> {
        try {
            const result = await this.paymentQueries.findAdminRevenueReport(payload);
            const { data: report, totalPages, currentPage, totalCount } = result;
            return {
                data: report,
                totalPages,
                currentPage,
                totalCount
            };
        } catch (error) {
            log.error("AdminFetchRevenueReportUseCase failed", error as Error);
            throw error;
        };
    };
};