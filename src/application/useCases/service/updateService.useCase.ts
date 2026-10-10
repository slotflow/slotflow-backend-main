import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { UpdateServiceInput, UpdateServiceOutput } from "../../dtos/service.dto";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";

export class UpdateServiceUseCase {
  constructor(private readonly seriveRepository: IServiceRepository) {}

  async execute(input: UpdateServiceInput): Promise<UpdateServiceOutput> {
    try {
      const { isBlocked, serviceCategory, serviceName, serviceId } = input;
      if (!serviceCategory || !serviceName || !serviceId) {
        throw new BadRequestError();
      }

      const service = await this.seriveRepository.findById(serviceId);
      if (!service) {
        throw new NotFoundError("Service not found.", ERROR_CODES.SERVICE_NOT_FOUND);
      }

      service.update({
        ...service,
        isBlocked: isBlocked,
        serviceName: serviceName,
        serviceCategory: serviceCategory,
      });

      const updatedService = await this.seriveRepository.update(service);
      if (!updatedService) {
        throw new AppError("Service updating failed.", 500, true, ERROR_CODES.INTERNAL_ERROR);
      }

      const { createdAt: _ct, updatedAt: _ut, ...data } = updatedService.getProps();

      return data;
    } catch (error: unknown) {
      throw toAppError(error, "Failed to change service block status");
    }
  }
}
