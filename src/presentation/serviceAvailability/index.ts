import { serviceAvailabilityQueries } from "../../infrastructure/queries";
import { providerProfileRepository, serviceAvailabilityRepository, userRepository } from "../../infrastructure/repository";
import { GetServiceAvailabilityUseCase } from "../../application/useCases/serviceAvailability/getServiceAvailability";
import { CreateServiceAvailabilitiesUseCase } from "../../application/useCases/serviceAvailability/createServiceAvailability";

export const createServiceAvailabilitiesUseCase = new CreateServiceAvailabilitiesUseCase(providerProfileRepository, serviceAvailabilityRepository);

export const getServiceAvailabilityUseCase = new GetServiceAvailabilityUseCase(providerProfileRepository, serviceAvailabilityQueries, userRepository);