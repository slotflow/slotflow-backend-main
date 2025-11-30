import { Types } from "mongoose";
import { Payment } from "../entities/payment.entity";
import { Provider } from "../entities/provider.entity";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest } from "../../infrastructure/dtos/common.dto";
import { ProviderFetchDashboardPaymentStatsDataResponse } from "../../infrastructure/dtos/provider.dto";
import { AdminFetchDashboardRevenueStatsDataResponse, AdminFetchDashboardTodayStatsDataResponse, AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../../infrastructure/dtos/admin.dto";

export type CreatePaymentForSubscriptionRequest = Pick<Payment, "transactionId" | "paymentStatus" | "paymentMethod" | "paymentGateway" | "paymentFor" | "initialAmount" | "discountAmount" | "providerId" | "totalAmount">;
export type CreatePaymentForBookingRequest = Pick<Payment, "transactionId" | "paymentStatus" | "paymentMethod" | "paymentGateway" | "paymentFor" | "initialAmount" | "discountAmount" | "userId" | "totalAmount" | "providerId">;
export type UpdateBookingRequest = Pick<Payment, "_id" | "transactionId" | "paymentStatus" | "paymentMethod" | "paymentGateway" | "paymentFor" | "initialAmount" | "discountAmount" | "userId" | "totalAmount" | "refundAmount" | "chargeId" | "refundAt" | "refundId" | "refundReason" | 'refundStatus'>;
export type AdminFetchDashboardTodayPaymentStatsDataResponse = Pick<AdminFetchDashboardTodayStatsDataResponse, "todaysTotalPayouts" | "todaysTotalRevenue">;

export interface IPaymentRepository {

    createPaymentForSubscription(payment: CreatePaymentForSubscriptionRequest, options?: { session?: any }): Promise<Payment | null>;

    createPaymentForBooking(payment: CreatePaymentForBookingRequest, options?: { session?: any }): Promise<Payment | null>;

    findAllPayments({ page, limit, userId, providerId }: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>>;

    findPaymentById(paymentId: Types.ObjectId): Promise<Payment | null>;

    updateBooking(payment: UpdateBookingRequest, options?: { session?: any }): Promise<Payment | null>;

    findPaymentStatsDataForProviderDashboard(providerId: Provider["_id"]): Promise<ProviderFetchDashboardPaymentStatsDataResponse>;

    findTodayPaymentStatsForAdminDashboard(): Promise<AdminFetchDashboardTodayPaymentStatsDataResponse>;

    findPaymentStatsForAdminDashboard(): Promise<AdminFetchDashboardRevenueStatsDataResponse>;

    findAdminRevenueReport(payload: AdminFetchRevenueReportRequest): Promise<ApiResponse<AdminFetchRevenueReportResponse>>;
}
