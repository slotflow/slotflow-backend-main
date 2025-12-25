import { TableData } from "../dtos/common.dto";
import { ProviderFetchDashboardPaymentStatsDataResponse } from "../dtos/provider.dto";
import { AdminFetchDashboardRevenueStatsDataResponse, AdminFetchDashboardTodayPaymentStatsDataResponse, AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../dtos/admin.dto";

export interface IPaymentQueries {

    findStatsDataForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardPaymentStatsDataResponse>;

    findTodayStatsDataForAdminDashboard(): Promise<AdminFetchDashboardTodayPaymentStatsDataResponse>;

    findStatsDataForAdminDashboard(): Promise<AdminFetchDashboardRevenueStatsDataResponse>;

    findAdminRevenueReport(payload: AdminFetchRevenueReportRequest): Promise<TableData<AdminFetchRevenueReportResponse>>;
    
}