import { FindProviderServiceResponse } from "../dtos/common.dto";
import { UserFetchServiceProvidersRequest, UserFetchServiceProvidersResponse } from "../dtos/user.dto";
import { ProviderUpdateProviderServiceRequest, ProviderUpdateProviderServiceResponse } from "../dtos/provider.dto";

export interface IProviderServiceQueries {

    findByProviderId(providerId: string): Promise<FindProviderServiceResponse | null>;

    findProvidersUsingServiceIds(payload: UserFetchServiceProvidersRequest): Promise<Array<UserFetchServiceProvidersResponse> | []>;

    updateProviderService(payload: ProviderUpdateProviderServiceRequest): Promise<ProviderUpdateProviderServiceResponse | null>;

}