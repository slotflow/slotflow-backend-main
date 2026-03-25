import { FetchProviderDataResponse } from "../dtos/admin.dto";

export interface IProviderQueries {

  fetchStats(): Promise<FetchProviderDataResponse>;

};
