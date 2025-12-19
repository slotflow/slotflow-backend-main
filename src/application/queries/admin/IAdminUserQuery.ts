import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";
import { AdminFetchAllUsers, AdminFetchDashboardUserStatsDataResponse } from "../../dtos/admin.dto";

export interface IAdminUserQuery {

    fetchStats(): Promise<AdminFetchDashboardUserStatsDataResponse>;

    findAll({ page, limit }: ApiPaginationRequest): Promise<TableData<AdminFetchAllUsers>>;

}