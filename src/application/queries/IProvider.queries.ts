import { FetchProviderDataRequest, FetchProviderDataResponse } from "../dtos/admin.dto";

export interface IProviderQueries {

  fetchStats(payload: FetchProviderDataRequest): Promise<FetchProviderDataResponse>;

};
