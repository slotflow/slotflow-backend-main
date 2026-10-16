import { serviceRepository } from "../../infrastructure/repository";
import { GetServicesUseCase } from "../../application/useCases/service/getServices.useCase";
import { CreateServiceUseCase } from "../../application/useCases/service/createService.useCase";
import { UpdateServiceUseCase } from "../../application/useCases/service/updateService.useCase";
import { CreateServicesUseCase } from "../../application/useCases/service/createServices.useCase";
import { ChangeServiceBlockStatusUseCase } from "../../application/useCases/service/changeBlockStatus.useCase";
import { GetServicesByCategoryUseCase } from "../../application/useCases/service/getServicesByCategory.useCase";

export const getServicesUseCase = new GetServicesUseCase(serviceRepository);

export const createServiceUseCase = new CreateServiceUseCase(serviceRepository);

export const createServicesUseCase = new CreateServicesUseCase(serviceRepository);

export const changeServiceBlockStatusUseCase = new ChangeServiceBlockStatusUseCase(
  serviceRepository,
);

export const getServicesByCategoryUseCase = new GetServicesByCategoryUseCase(serviceRepository);

export const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);
