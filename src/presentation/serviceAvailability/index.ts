import { serviceAvailabilityQueries } from "../../infrastructure/queriesImpls";
import { providerRepository, serviceAvailabilityRepository } from "../../infrastructure/repositoryImpls";
import { GetServiceAvailabilityUseCase } from "../../application/useCases/serviceAvailability/getServiceAvailability";
import { CreateServiceAvailabilitiesUseCase } from "../../application/useCases/serviceAvailability/createServiceAvailability";

export const createServiceAvailabilitiesUseCase = new CreateServiceAvailabilitiesUseCase(providerRepository, serviceAvailabilityRepository);

export const getServiceAvailabilityUseCase = new GetServiceAvailabilityUseCase(providerRepository, serviceAvailabilityQueries);