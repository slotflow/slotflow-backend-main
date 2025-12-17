import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest } from "../../dtos/common.dto";
import { AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../../dtos/admin.dto";

export class AdminFetchAllPaymentsUseCase {
    constructor(
        private paymentRepository: IPaymentRepository,
    ) { }

    async execute(payload: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        try {
            const result = await this.paymentRepository.findAllPayments(payload);
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
        private paymentRepository: IPaymentRepository,
    ) { }

    async execute(payload: AdminFetchRevenueReportRequest): Promise<ApiResponse<AdminFetchRevenueReportResponse>> {
        try {
            const result = await this.paymentRepository.findAdminRevenueReport(payload);
            if (!result) throw new Error("Revenue report generatin failed");
            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminFetchRevenueReportUseCase error : ", error);
            throw new Error("Failed to Fetch revenue report");
        }
    }
}