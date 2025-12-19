import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";
import { AdiminFetchAllProviders, AdminFetchDashboardProviderStatsDataResponse } from "../../dtos/admin.dto";

export interface IAdminProviderQuery {

  fetchStats(): Promise<AdminFetchDashboardProviderStatsDataResponse>;

  findAll({ page, limit }: ApiPaginationRequest): Promise<TableData<AdiminFetchAllProviders>>;
  
};
