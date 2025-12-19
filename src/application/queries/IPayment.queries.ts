import { ProviderFetchDashboardPaymentStatsDataResponse } from "../dtos/provider.dto";
import { FetchPaymentResponse, FetchPaymentsRequest, TableData } from "../dtos/common.dto";
import { AdminFetchDashboardRevenueStatsDataResponse, AdminFetchDashboardTodayPaymentStatsDataResponse, AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../dtos/admin.dto";

export interface IPaymentQueries {

    findAll({ page, limit, userId, providerId }: FetchPaymentsRequest): Promise<TableData<FetchPaymentResponse>>;

    findStatsForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardPaymentStatsDataResponse>;

    findTodayStatsForAdminDashboard(): Promise<AdminFetchDashboardTodayPaymentStatsDataResponse>;

    findStatsForAdminDashboard(): Promise<AdminFetchDashboardRevenueStatsDataResponse>;

    findAdminRevenueReport(payload: AdminFetchRevenueReportRequest): Promise<TableData<AdminFetchRevenueReportResponse>>;
    
}