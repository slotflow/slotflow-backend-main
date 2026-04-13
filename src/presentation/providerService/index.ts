import { providerServiceQueries } from "../../infrastructure/queriesImpls";
import { providerProfileRepository, providerServiceRepository } from "../../infrastructure/repositoryImpls";
import { GetProviderServicesUseCase } from "../../application/useCases/providerService/getProviderServices.useCase";
import { CreateProviderServiceUseCase } from "../../application/useCases/providerService/createProviderService.useCase";
import { UpdateProviderServiceUseCase } from "../../application/useCases/providerService/updateProviderService.useCase";

export const createProviderServiceUseCase = new CreateProviderServiceUseCase(providerProfileRepository, providerServiceRepository);

export const getProviderServicesUseCase = new GetProviderServicesUseCase(providerServiceQueries);

export const updateProviderServiceUseCase = new UpdateProviderServiceUseCase(providerServiceRepository);