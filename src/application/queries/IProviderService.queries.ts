import { FindProviderServiceResponse, FindProvidersUsingServiceIdsResponse } from "../dtos/common.dto";
import { ProviderUpdateProviderServiceRequest, ProviderUpdateProviderServiceResponse } from "../dtos/provider.dto";

export interface IProviderServiceQueries {

    findByProviderId(providerId: string): Promise<FindProviderServiceResponse | null>;

    findProvidersUsingServiceIds(serviceIds: string[]): Promise<Array<FindProvidersUsingServiceIdsResponse> | []>;

    updateProviderService(payload: ProviderUpdateProviderServiceRequest): Promise<ProviderUpdateProviderServiceResponse | null>;

}