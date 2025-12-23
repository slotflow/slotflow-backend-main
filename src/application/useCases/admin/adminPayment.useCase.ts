import { log } from "../../../shared/logger/logger";
import { IPaymentQueries } from "../../queries/IPayment.queries";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../../dtos/admin.dto";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest, TableData } from "../../dtos/common.dto";

export class AdminFetchAllPaymentsUseCase {
    constructor(
        private paymentRepository: IPaymentRepository,
    ) { }

    async execute(payload: FetchPaymentsRequest): Promise<TableData<FetchPaymentResponse>> {
        try {
            const { page, limit, userId, providerId } = payload;
            const result = await this.paymentRepository.findAll(page, limit, userId, providerId);
            return {
                // TODO NEED TO CHECK THE RESULT.DATA IF IT IS HAVING THE ALL FIELDS OR THE PROJECTED FIELDS
                data: result.data.map(data => ({
                    _id: data._id,
                    createdAt: data.createdAt,
                    discountAmount: data.discountAmount,
                    paymentFor: data.paymentFor,
                    paymentGateway: data.paymentGateway,
                    paymentMethod: data.paymentMethod,
                    paymentStatus: data.paymentStatus,
                    totalAmount: data.totalAmount
                })),
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                totalCount: result.totalCount
            };
        } catch (error) {
            log.error("AdminFetchAllPaymentsUseCase failed", error as Error);
            throw error;
        }
    }
}

export class AdminFetchRevenueReportUseCase {
    constructor(
        private paymentQueries: IPaymentQueries,
    ) { }

    async execute(payload: AdminFetchRevenueReportRequest): Promise<ApiResponse<AdminFetchRevenueReportResponse>> {
        try {
            const result = await this.paymentQueries.findAdminRevenueReport(payload);
            return {
                data: result.data,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                totalCount: result.totalCount
            };
        } catch (error) {
            log.error("AdminFetchRevenueReportUseCase failed", error as Error);
            throw error;
        }
    }
}