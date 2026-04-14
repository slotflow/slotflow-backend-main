import { ServiceAvailabilityQuery, ServiceAvailabilityView } from "../dtos/serviceAvailability.dto";

export interface IServiceAvailabilityQueries {

    findByProviderId(query: ServiceAvailabilityQuery): Promise<ServiceAvailabilityView>;

};