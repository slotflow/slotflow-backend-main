import { FindProviderServiceResponse } from "../dtos/common.dto";
import { GetProvidersByFilterRequest, GetProvidersByFilterResponse } from "../dtos/provider.dto";
import { UpdateProviderServiceRequest, UpdateProviderServiceResponse } from "../dtos/providerService";

export interface IProviderServiceQueries {

    findByProviderId(providerId: string): Promise<FindProviderServiceResponse | null>;

    findProvidersUsingServiceIds(payload: GetProvidersByFilterRequest): Promise<Array<GetProvidersByFilterResponse> | []>;

    updateProviderService(payload: UpdateProviderServiceRequest): Promise<UpdateProviderServiceResponse | null>;

}