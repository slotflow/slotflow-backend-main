import { ProviderServiceByProviderIdQuery, ProviderServiceByProviderIdView, ProviderServiceByServiceIdsQuery, ProviderServiceByServiceIdsView, UpdateProviderServiceQuery, UpdateProviderServiceView } from "../dtos/providerService";

export interface IProviderServiceQueries {

    findByProviderId(query: ProviderServiceByProviderIdQuery): Promise<ProviderServiceByProviderIdView | null>;

    findProvidersUsingServiceIds(query: ProviderServiceByServiceIdsQuery): Promise<ProviderServiceByServiceIdsView>;

    updateProviderService(query: UpdateProviderServiceQuery): Promise<UpdateProviderServiceView>;

}