import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest } from "../../infrastructure/dtos/common.dto";
import { AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../../infrastructure/dtos/admin.dto";

export class AdminFetchAllPaymentsUseCase {
    constructor(
        private paymentRepositoryImpl: PaymentRepositoryImpl,
    ) { }

    async execute(payload: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        try {
            const result = await this.paymentRepositoryImpl.findAllPayments(payload);
            if (!result) throw new Error("Payments fetching failed");
            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminFetchAllPaymentsUseCase error : ", error);
            throw new Error("Failed to Fetch all payments");
        }
    }
}

export class AdminFetchRevenueReportUseCase {
    constructor(
        private paymentRepositoryImpl: PaymentRepositoryImpl,
    ) { }

    async execute(payload: AdminFetchRevenueReportRequest): Promise<ApiResponse<AdminFetchRevenueReportResponse>> {
        try {
            const result = await this.paymentRepositoryImpl.findAdminRevenueReport(payload);
            if (!result) throw new Error("Revenue report generatin failed");
            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminFetchRevenueReportUseCase error : ", error);
            throw new Error("Failed to Fetch revenue report");
        }
    }
}