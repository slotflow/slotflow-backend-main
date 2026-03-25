import { TableData } from "../dtos/common.dto";
import { ProviderFetchDashboardPaymentStatsDataResponse } from "../dtos/provider.dto";
import { FetchRevenueDataResponse, AdminFetchDashboardTodayPaymentStatsDataResponse, AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../dtos/admin.dto";

export interface IPaymentQueries {

    findStatsDataForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardPaymentStatsDataResponse>;

    findTodayStatsDataForAdminDashboard(): Promise<AdminFetchDashboardTodayPaymentStatsDataResponse>;

    findStatsDataForAdminDashboard(): Promise<FetchRevenueDataResponse>;

    findAdminRevenueReport(payload: AdminFetchRevenueReportRequest): Promise<TableData<AdminFetchRevenueReportResponse>>;

}