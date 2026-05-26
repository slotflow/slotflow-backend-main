import { serviceRepository } from "../../infrastructure/repositoryImpls";
import { GetServicesUseCase } from "../../application/useCases/service/getServices.useCase";
import { CreateServiceUseCase } from "../../application/useCases/service/createService.useCase";
import { ChangeServiceBlockStatusUseCase } from "../../application/useCases/service/changeBlockStatus.useCase";
import { GetServicesByCategoryUseCase } from "../../application/useCases/service/getServicesByCategory.useCase";

export const getServicesUseCase = new GetServicesUseCase(serviceRepository);

export const createServiceUseCase = new CreateServiceUseCase(serviceRepository);

export const changeServiceBlockStatusUseCase = new ChangeServiceBlockStatusUseCase(serviceRepository)

export const getServicesByCategoryUseCase = new GetServicesByCategoryUseCase(serviceRepository);