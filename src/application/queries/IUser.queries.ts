import { ApiPaginationRequest, TableData } from "../dtos/common.dto";
import { GetProviderDataRequest, GetProviderDataResponse } from "../dtos/admin.dto";
import { GetProvidersResponse, GetUsersResponse, GetUserDataResponse, GetUserDataRequest, GetProviderProfileDetailsResponse } from "../dtos/user.dto";


export interface IUserQueries {

    findStats(payload: GetUserDataRequest): Promise<GetUserDataResponse>;

    findUsers({ page, limit }: ApiPaginationRequest): Promise<TableData<GetUsersResponse>>;

    findProviders({ page, limit }: ApiPaginationRequest): Promise<TableData<GetProvidersResponse>>;

    findProviderById(providerId: string): Promise<GetProviderProfileDetailsResponse | null>;

    findproviderStats(payload: GetProviderDataRequest): Promise<GetProviderDataResponse>;

}