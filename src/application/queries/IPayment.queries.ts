import { TableData } from "../dtos/common.dto";
import { ProviderFetchDashboardPaymentStatsDataResponse } from "../dtos/provider.dto";
import { AdminFetchDashboardRevenueStatsDataResponse, AdminFetchDashboardTodayPaymentStatsDataResponse, AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../dtos/admin.dto";

export interface IPaymentQueries {

    findStatsForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardPaymentStatsDataResponse>;

    findTodayStatsForAdminDashboard(): Promise<AdminFetchDashboardTodayPaymentStatsDataResponse>;

    findStatsForAdminDashboard(): Promise<AdminFetchDashboardRevenueStatsDataResponse>;

    findAdminRevenueReport(payload: AdminFetchRevenueReportRequest): Promise<TableData<AdminFetchRevenueReportResponse>>;
    
}