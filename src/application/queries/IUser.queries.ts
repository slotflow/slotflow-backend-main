import { GetUsersResponse } from "../dtos/user.dto";
import { ApiPaginationRequest, TableData } from "../dtos/common.dto";
import { FetchUserDataRequest, FetchUserDataResponse } from "../dtos/admin.dto";

export interface IUserQueries {

    fetchStats(payload: FetchUserDataRequest): Promise<FetchUserDataResponse>;

    findAll({ page, limit }: ApiPaginationRequest): Promise<TableData<GetUsersResponse>>;

}