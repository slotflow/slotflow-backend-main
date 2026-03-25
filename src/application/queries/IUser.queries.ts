import { ApiPaginationRequest, TableData } from "../dtos/common.dto";
import { AdminFetchAllUsers, FetchUserDataResponse } from "../dtos/admin.dto";

export interface IUserQueries {

    fetchStats(): Promise<FetchUserDataResponse>;

    findAll({ page, limit }: ApiPaginationRequest): Promise<TableData<AdminFetchAllUsers>>;

}