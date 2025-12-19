import { ApiPaginationRequest, TableData } from "../dtos/common.dto";
import { AdiminFetchAllProviders, AdminFetchDashboardProviderStatsDataResponse } from "../dtos/admin.dto";

export interface IProviderQueries {

  fetchStats(): Promise<AdminFetchDashboardProviderStatsDataResponse>;

  findAll({ page, limit }: ApiPaginationRequest): Promise<TableData<AdiminFetchAllProviders>>;
  
};
