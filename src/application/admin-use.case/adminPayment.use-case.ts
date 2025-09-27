import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../../infrastructure/dtos/admin.dto";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest } from "../../infrastructure/dtos/common.dto";

export class AdminFetchAllPaymentsUseCase {
    constructor(
        private paymentRepositoryImpl: PaymentRepositoryImpl,
    ) {}

    async execute({ page, limit }: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        const result = await this.paymentRepositoryImpl.findAllPayments({ page, limit });
        if (!result) throw new Error("Payments fetching failed");
        return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
    }
}

export class AdminFetchRevenueReportUseCase {
    constructor(
        private paymentRepositoryImpl: PaymentRepositoryImpl,
    ) { }
    
    async execute(payload: AdminFetchRevenueReportRequest): Promise<ApiResponse<AdminFetchRevenueReportResponse>> {
        const result = await this.paymentRepositoryImpl.fetchAdminRevenueReport(payload);
        if(!result) throw new Error("Revenue report generatin failed");
        return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
    }
}