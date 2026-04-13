import { serviceAvailabilityQueries } from "../../infrastructure/queriesImpls";
import { providerProfileRepository, serviceAvailabilityRepository } from "../../infrastructure/repositoryImpls";
import { GetServiceAvailabilityUseCase } from "../../application/useCases/serviceAvailability/getServiceAvailability";
import { CreateServiceAvailabilitiesUseCase } from "../../application/useCases/serviceAvailability/createServiceAvailability";

export const createServiceAvailabilitiesUseCase = new CreateServiceAvailabilitiesUseCase(providerProfileRepository, serviceAvailabilityRepository);

export const getServiceAvailabilityUseCase = new GetServiceAvailabilityUseCase(providerProfileRepository, serviceAvailabilityQueries);