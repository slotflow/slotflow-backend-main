import { AdminFetchDashboardProviderStatsDataResponse } from "../dtos/admin.dto";

export interface IProviderQueries {

  fetchStats(): Promise<AdminFetchDashboardProviderStatsDataResponse>;
  
};
